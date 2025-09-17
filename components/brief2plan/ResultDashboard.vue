<template>
  <div v-if="!brief || !spec" class="rounded-xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
    <p class="text-slate-500">解析結果がここに表示されます。</p>
  </div>
  <div v-else class="space-y-6">
    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">{{ brief.title }}</h2>
          <p class="mt-1 text-sm text-slate-500">
            {{ brief.industry || '業界未設定' }} · {{ brief.sizeHint || '規模未設定' }} · 作成日 {{ formatDate(brief.createdAt) }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            class="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-primary-400"
            type="button"
            @click="emit('export-pdf')"
          >
            PDF出力
          </button>
          <button
            class="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-primary-400"
            type="button"
            @click="emit('open-share')"
          >
            共有リンク
          </button>
          <button
            class="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-primary-400 disabled:opacity-60"
            type="button"
            :disabled="!githubEnabled"
            @click="emit('open-github')"
          >
            GitHub連携
          </button>
        </div>
      </div>
      <CostCards v-if="estimate" class="mt-6" :estimate="estimate" :rate-per-hour="brief.ratePerHour" />
    </div>

    <TabGroup v-if="spec" as="div" class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <TabList class="flex gap-2 overflow-x-auto">
        <Tab v-for="tab in tabs" :key="tab.id" v-slot="{ selected }" as="template">
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium"
            :class="selected ? 'bg-primary-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'"
          >
            {{ tab.label }}
          </button>
        </Tab>
      </TabList>
      <TabPanels class="mt-4">
        <TabPanel class="space-y-4">
          <section>
            <h3 class="text-lg font-semibold text-slate-800">機能要件</h3>
            <div class="mt-3 grid gap-3 md:grid-cols-2">
              <article
                v-for="item in spec.functional"
                :key="item.name"
                class="rounded-lg border border-slate-200 bg-slate-50/80 p-4"
              >
                <h4 class="font-semibold text-slate-900">{{ item.name }}</h4>
                <p class="mt-1 text-sm text-slate-600">{{ item.desc }}</p>
                <p class="mt-2 text-xs font-medium text-emerald-700">受入条件: {{ item.acceptance }}</p>
              </article>
            </div>
          </section>
          <section>
            <h3 class="text-lg font-semibold text-slate-800">非機能要件</h3>
            <ul class="mt-2 space-y-2 text-sm text-slate-600">
              <li v-for="item in spec.nonFunctional" :key="item.name">
                <span class="font-medium text-slate-800">{{ item.name }}:</span>
                {{ item.metric }} {{ item.threshold }}
              </li>
            </ul>
          </section>
          <section class="grid gap-6 md:grid-cols-2">
            <div>
              <h3 class="text-lg font-semibold text-slate-800">前提</h3>
              <ul class="mt-2 space-y-2 text-sm text-slate-600">
                <li v-for="item in spec.assumptions" :key="item">・{{ item }}</li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-800">リスクと対応</h3>
              <ul class="mt-2 space-y-2 text-sm text-slate-600">
                <li v-for="item in spec.risks" :key="item.desc">
                  <p class="font-medium text-slate-800">{{ item.desc }}</p>
                  <p class="text-xs text-slate-500">Mitigation: {{ item.mitigation }}</p>
                </li>
              </ul>
            </div>
          </section>
        </TabPanel>
        <TabPanel class="space-y-4">
          <section>
            <h3 class="text-lg font-semibold text-slate-800">WBS ツリー</h3>
            <ul class="mt-2 space-y-2 border-l border-slate-200 pl-4">
              <li v-for="task in topLevelTasks" :key="task.id" class="space-y-2">
                <div>
                  <p class="font-semibold text-slate-900">{{ task.name }}</p>
                  <p class="text-xs text-slate-500">O/M/P: {{ task.optimisticH }} / {{ task.mostLikelyH }} / {{ task.pessimisticH }} h</p>
                </div>
                <ul class="ml-4 space-y-1">
                  <li v-for="child in getChildren(task.id)" :key="child.id" class="rounded-lg bg-slate-50 px-3 py-2">
                    <p class="text-sm font-medium text-slate-800">{{ child.name }}</p>
                    <p class="text-xs text-slate-500">依存: {{ child.dependsOn.length ? child.dependsOn.join(', ') : 'なし' }}</p>
                  </li>
                </ul>
              </li>
            </ul>
          </section>
          <section v-if="estimate">
            <h3 class="text-lg font-semibold text-slate-800">簡易ガント</h3>
            <GanttLite :tasks="tasks" :critical-path="estimate.criticalPath" />
          </section>
        </TabPanel>
        <TabPanel v-if="estimate" class="space-y-6">
          <section>
            <h3 class="text-lg font-semibold text-slate-800">PERT 結果</h3>
            <div class="grid gap-4 md:grid-cols-2">
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p class="text-sm text-slate-500">期待工数</p>
                <p class="text-2xl font-semibold text-slate-900">{{ estimate.expectedHours.toFixed(1) }} 時間</p>
              </div>
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p class="text-sm text-slate-500">標準偏差</p>
                <p class="text-2xl font-semibold text-slate-900">{{ estimate.stdDevHours.toFixed(2) }} 時間</p>
              </div>
            </div>
            <div class="mt-4">
              <h4 class="text-sm font-semibold text-slate-700">クリティカルパス</h4>
              <ol class="mt-2 list-decimal space-y-2 pl-6 text-sm text-slate-600">
                <li v-for="node in estimate.criticalPath" :key="node.id">
                  {{ node.name }} (終了: {{ node.finish.toFixed(1) }}h)
                </li>
              </ol>
            </div>
          </section>
          <section>
            <h3 class="text-lg font-semibold text-slate-800">Monte Carlo シミュレーション</h3>
            <div class="grid gap-4 md:grid-cols-2">
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p>P50 完了: {{ formatDate(estimate.mcP50Date) }}</p>
                <p>P80 完了: {{ formatDate(estimate.mcP80Date) }}</p>
                <p v-if="estimate.probabilityByTarget">
                  目標達成確率: {{ estimate.probabilityByTarget.toFixed(1) }}%
                </p>
              </div>
              <HistogramChart :bins="estimate.histogram" />
            </div>
          </section>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue';

import GanttLite from '~/components/brief2plan/GanttLite.vue';
import HistogramChart from '~/components/brief2plan/HistogramChart.vue';
import CostCards from '~/components/brief2plan/CostCards.vue';
import type {
  BriefRecord,
  EstimateSummaryResponse,
  GeneratedTaskInput,
  StructuredSpecPayload
} from '~/types/brief2plan';

const props = defineProps<{
  brief: BriefRecord | null;
  spec: StructuredSpecPayload | null;
  tasks: GeneratedTaskInput[];
  estimate: EstimateSummaryResponse | null;
  githubEnabled: boolean;
}>();

const emit = defineEmits(['export-pdf', 'open-share', 'open-github']);

const tabs = [
  { id: 'spec', label: '要件サマリ' },
  { id: 'wbs', label: 'WBS / ガント' },
  { id: 'estimate', label: '見積結果' }
];

const topLevelTasks = computed(() => props.tasks.filter((task) => !task.parentId));
const getChildren = (parentId: string) => props.tasks.filter((task) => task.parentId === parentId);

const formatDate = (value?: string | null) => {
  if (!value) return '未設定';
  return new Date(value).toLocaleDateString('ja-JP');
};
</script>
