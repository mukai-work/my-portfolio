<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-200"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-150"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-slate-900/40" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="ease-out duration-200"
            enter-from="opacity-0 translate-y-2"
            enter-to="opacity-100 translate-y-0"
            leave="ease-in duration-150"
            leave-from="opacity-100"
            leave-to="opacity-0 translate-y-2"
          >
            <DialogPanel class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
              <DialogTitle class="text-lg font-semibold text-slate-900">GitHub Issue 作成</DialogTitle>
              <p class="mt-1 text-sm text-slate-500">リポジトリの owner/name を入力してください。</p>

              <form class="mt-4 space-y-4" @submit.prevent="onSubmit">
                <label class="block text-sm font-medium text-slate-700" for="repo">リポジトリ</label>
                <input
                  id="repo"
                  v-model="repo"
                  type="text"
                  placeholder="example/brief2plan"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  required
                />
                <div class="flex items-center justify-end gap-3">
                  <button type="button" class="text-sm text-slate-500" @click="emit('close')">キャンセル</button>
                  <button
                    type="submit"
                    class="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    :disabled="loading"
                  >
                    <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
                    </svg>
                    Issue を作成
                  </button>
                </div>
              </form>

              <div v-if="result" class="mt-6 space-y-2">
                <p class="text-sm font-semibold text-emerald-600">{{ result.dryRun ? 'モックモードで成功' : '作成完了' }}</p>
                <ul class="max-h-32 overflow-y-auto text-sm text-slate-600">
                  <li v-for="url in result.issueUrls" :key="url">
                    <a :href="url" class="text-primary-600 hover:underline" target="_blank" rel="noopener">{{ url }}</a>
                  </li>
                </ul>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

interface GithubResult {
  dryRun: boolean;
  issueUrls: string[];
  createdIssues: number;
}

const props = defineProps<{
  open: boolean;
  loading: boolean;
  result?: GithubResult | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'export', payload: { repo: string }): void;
}>();

const repo = ref('');

watch(
  () => props.open,
  (value) => {
    if (value) {
      repo.value = '';
    }
  }
);

const onSubmit = () => {
  emit('export', { repo: repo.value.trim() });
};

const result = computed(() => props.result ?? null);
</script>
