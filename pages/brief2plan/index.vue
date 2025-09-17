<template>
  <main class="mx-auto max-w-6xl space-y-10 px-4 py-10">
    <section class="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 class="text-3xl font-bold text-slate-900">Brief2Plan</h1>
      <p class="mt-2 text-slate-600">
        要件メモを貼り付けるだけで、構造化要件・WBS・PERT見積・コスト試算・PDF出力・GitHub Issue連携までを自動化します。
      </p>
      <p v-if="!githubEnabled" class="mt-2 text-sm text-amber-600">GitHubトークンが未設定のため Issue 連携は利用できません。</p>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <RequirementsEditor :loading="loading" :defaults="defaults" @submit="handleSubmit" />
      <p v-if="error" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{{ error }}</p>
    </section>

    <section>
      <ResultDashboard
        :brief="brief"
        :spec="spec"
        :tasks="tasks"
        :estimate="estimate"
        :github-enabled="githubEnabled"
        @export-pdf="handlePdf"
        @open-share="shareOpen = true"
        @open-github="githubOpen = true"
      />
    </section>

    <ShareLinkModal
      :open="shareOpen"
      :loading="shareLoading"
      :link="shareLink"
      :expires="shareExpires"
      @close="closeShare"
      @create="handleShare"
    />

    <GithubExportModal
      :open="githubOpen"
      :loading="githubLoading"
      :result="githubResult"
      @close="closeGithub"
      @export="handleGithub"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import GithubExportModal from '~/components/brief2plan/GithubExportModal.vue';
import RequirementsEditor from '~/components/brief2plan/RequirementsEditor.vue';
import ResultDashboard from '~/components/brief2plan/ResultDashboard.vue';
import ShareLinkModal from '~/components/brief2plan/ShareLinkModal.vue';
import type {
  BriefRecord,
  EstimateSummaryResponse,
  GeneratedTaskInput,
  StructuredSpecPayload
} from '~/types/brief2plan';

const runtimeConfig = useRuntimeConfig();
useHead({ title: 'Brief2Plan' });

const defaults = reactive({
  ratePerHour: runtimeConfig.public.defaultRatePerHour || 12000,
  marginRate: 0.3,
  bufferRate: 0.15
});

const loading = ref(false);
const error = ref('');
const currentBriefId = ref<string | null>(null);
const brief = ref<BriefRecord | null>(null);
const spec = ref<StructuredSpecPayload | null>(null);
const tasks = ref<GeneratedTaskInput[]>([]);
const estimate = ref<EstimateSummaryResponse | null>(null);

const shareOpen = ref(false);
const shareLoading = ref(false);
const shareLink = ref<string | null>(null);
const shareExpires = ref<string | null>(null);

const githubOpen = ref(false);
const githubLoading = ref(false);
const githubResult = ref<{ dryRun: boolean; issueUrls: string[]; createdIssues: number } | null>(null);

const githubEnabled = computed(() => Boolean(runtimeConfig.public.githubEnabled));

const transformEstimate = (payload: EstimateSummaryResponse): EstimateSummaryResponse => ({
  ...payload,
  mcP50Date: payload.mcP50Date,
  mcP80Date: payload.mcP80Date
});

const handleSubmit = async (payload: {
  rawText: string;
  industry?: string;
  sizeHint?: string;
  ratePerHour: number;
  marginRate: number;
  bufferRate: number;
  targetDeadline?: string;
  keywords?: string;
}) => {
  error.value = '';
  loading.value = true;
  shareLink.value = null;
  githubResult.value = null;
  try {
    const { briefId } = await $fetch<{ briefId: string }>('/api/brief/parse', {
      method: 'POST',
      body: payload
    });
    currentBriefId.value = briefId;
    const detail = await $fetch<{
      brief: BriefRecord;
      spec: StructuredSpecPayload;
      tasks: GeneratedTaskInput[];
      estimate: EstimateSummaryResponse | null;
    }>(`/api/brief/${briefId}`);
    brief.value = {
      ...detail.brief,
      createdAt: detail.brief.createdAt
    };
    spec.value = detail.spec;
    tasks.value = detail.tasks;
    if (detail.estimate) {
      estimate.value = transformEstimate(detail.estimate);
    } else {
      const estimateResponse = await $fetch<EstimateSummaryResponse>(`/api/brief/${briefId}/estimate`, {
        method: 'POST'
      });
      estimate.value = transformEstimate(estimateResponse);
    }
  } catch (fetchError: unknown) {
    console.error(fetchError);
    error.value = fetchError instanceof Error ? fetchError.message : '解析に失敗しました';
  } finally {
    loading.value = false;
  }
};

const handlePdf = async () => {
  if (!currentBriefId.value) return;
  try {
    const buffer = await $fetch<ArrayBuffer>(`/api/brief/${currentBriefId.value}/pdf`, {
      method: 'POST',
      responseType: 'arrayBuffer'
    });
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `brief-${currentBriefId.value}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  } catch (fetchError: unknown) {
    console.error(fetchError);
    error.value = 'PDF生成に失敗しました';
  }
};

const handleShare = async ({ ttlHours }: { ttlHours: number }) => {
  if (!currentBriefId.value) return;
  shareLoading.value = true;
  try {
    const response = await $fetch<{ publicUrl: string; expiresAt: string }>(
      `/api/brief/${currentBriefId.value}/share`,
      {
        method: 'POST',
        body: { ttlHours }
      }
    );
    shareLink.value = response.publicUrl;
    shareExpires.value = response.expiresAt;
  } catch (fetchError: unknown) {
    console.error(fetchError);
    error.value = '共有リンクの作成に失敗しました';
  } finally {
    shareLoading.value = false;
  }
};

const handleGithub = async ({ repo }: { repo: string }) => {
  if (!currentBriefId.value) return;
  githubLoading.value = true;
  try {
    const result = await $fetch<{ dryRun: boolean; issueUrls: string[]; createdIssues: number }>(
      `/api/brief/${currentBriefId.value}/github`,
      {
        method: 'POST',
        body: { repo }
      }
    );
    githubResult.value = result;
  } catch (fetchError: unknown) {
    console.error(fetchError);
    error.value =
      fetchError instanceof Error ? fetchError.message : 'GitHub Issue の作成に失敗しました';
  } finally {
    githubLoading.value = false;
  }
};

const closeShare = () => {
  shareOpen.value = false;
};

const closeGithub = () => {
  githubOpen.value = false;
};
</script>
