<template>
  <div class="grid gap-4 md:grid-cols-4">
    <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p class="text-xs uppercase tracking-wide text-slate-500">期待工数</p>
      <p class="mt-2 text-2xl font-semibold text-slate-900">{{ estimate.expectedHours.toFixed(1) }}h</p>
    </div>
    <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p class="text-xs uppercase tracking-wide text-slate-500">標準偏差</p>
      <p class="mt-2 text-2xl font-semibold text-slate-900">{{ estimate.stdDevHours.toFixed(2) }}h</p>
    </div>
    <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p class="text-xs uppercase tracking-wide text-slate-500">原価</p>
      <p class="mt-2 text-2xl font-semibold text-slate-900">¥{{ Math.round(estimate.costPrice).toLocaleString('ja-JP') }}</p>
      <p class="text-xs text-slate-500">@ {{ ratePerHour.toLocaleString('ja-JP') }} 円/人時</p>
    </div>
    <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p class="text-xs uppercase tracking-wide text-slate-500">見積金額</p>
      <p class="mt-2 text-2xl font-semibold text-emerald-600">¥{{ Math.round(estimate.sellPrice).toLocaleString('ja-JP') }}</p>
      <p class="text-xs text-slate-500">粗利率 {{ (estimate.grossMargin * 100).toFixed(1) }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EstimateSummaryResponse } from '~/types/brief2plan';

const props = defineProps<{
  estimate: EstimateSummaryResponse;
  ratePerHour: number;
}>();

// noop script: props used directly in template
</script>
