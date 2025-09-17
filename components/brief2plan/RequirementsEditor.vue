<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <div>
      <label class="block text-sm font-medium text-slate-700">要件メモ</label>
      <textarea
        v-model="form.rawText"
        class="mt-2 w-full rounded-lg border border-slate-300 bg-white p-4 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        rows="8"
        placeholder="例: 新しいSaaSダッシュボードを構築したい..."
        required
      ></textarea>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div>
        <label class="block text-sm font-medium text-slate-700">対象業界</label>
        <input
          v-model="form.industry"
          type="text"
          class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          placeholder="SaaS / EC / 建設 など"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700">規模感</label>
        <select
          v-model="form.sizeHint"
          class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          <option value="">未設定</option>
          <option value="小規模">小規模</option>
          <option value="中規模">中規模</option>
          <option value="大規模">大規模</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700">目標納期</label>
        <input
          v-model="form.targetDeadline"
          type="date"
          class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-4">
      <div>
        <label class="block text-sm font-medium text-slate-700">レート (円/人時)</label>
        <input
          v-model.number="form.ratePerHour"
          type="number"
          min="1000"
          step="500"
          class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          required
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700">利益率</label>
        <div class="mt-2 flex items-center space-x-2">
          <input
            v-model.number="form.marginRate"
            type="number"
            min="0"
            max="1"
            step="0.05"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            required
          />
          <span class="text-sm text-slate-500">(0.3 = 30%)</span>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700">バッファ率</label>
        <div class="mt-2 flex items-center space-x-2">
          <input
            v-model.number="form.bufferRate"
            type="number"
            min="0"
            max="1"
            step="0.05"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            required
          />
          <span class="text-sm text-slate-500">(0.15 = 15%)</span>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700">補助キーワード</label>
        <input
          v-model="form.keywords"
          type="text"
          placeholder="ログイン / レポート / API など"
          class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </div>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-500">
        OpenAIキー未設定時はルールベースで初期WBSを生成します。
      </p>
      <button
        type="submit"
        class="inline-flex items-center rounded-lg bg-primary-600 px-6 py-2 font-semibold text-white shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
        :disabled="disabled"
      >
        <span v-if="disabled" class="flex items-center space-x-2">
          <svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4"></circle>
            <path class="opacity-75" d="M4 12a8 8 0 018-8" stroke-width="4" stroke-linecap="round"></path>
          </svg>
          <span>解析中...</span>
        </span>
        <span v-else>解析する</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';

type SizeHint = '小規模' | '中規模' | '大規模' | '';

const props = defineProps<{
  loading: boolean;
  defaults: {
    ratePerHour: number;
    marginRate: number;
    bufferRate: number;
  };
}>();

const emit = defineEmits<{
  (e: 'submit', payload: {
    rawText: string;
    industry?: string;
    sizeHint?: string;
    ratePerHour: number;
    marginRate: number;
    bufferRate: number;
    targetDeadline?: string;
    keywords?: string;
  }): void;
}>();

const form = reactive({
  rawText: '',
  industry: '',
  sizeHint: '' as SizeHint,
  ratePerHour: props.defaults.ratePerHour,
  marginRate: props.defaults.marginRate,
  bufferRate: props.defaults.bufferRate,
  targetDeadline: '',
  keywords: ''
});

const disabled = computed(() => props.loading || form.rawText.trim().length < 20);

const onSubmit = () => {
  if (disabled.value) {
    return;
  }
  emit('submit', {
    rawText: form.rawText,
    industry: form.industry || undefined,
    sizeHint: form.sizeHint || undefined,
    ratePerHour: Number(form.ratePerHour),
    marginRate: Number(form.marginRate),
    bufferRate: Number(form.bufferRate),
    targetDeadline: form.targetDeadline || undefined,
    keywords: form.keywords || undefined
  });
};
</script>
