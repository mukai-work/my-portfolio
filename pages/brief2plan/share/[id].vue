<template>
  <main class="mx-auto max-w-4xl space-y-6 px-4 py-12">
    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-bold text-slate-900">Brief2Plan 共有ビュー</h1>
      <p class="mt-1 text-sm text-slate-500">編集はできません。閲覧のみ可能です。</p>
      <p v-if="error" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{{ error }}</p>
    </section>

    <section v-if="data" class="space-y-6">
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-slate-900">{{ data.brief.title }}</h2>
        <p class="mt-2 text-sm text-slate-600">
          {{ data.brief.industry || '業界未設定' }} · {{ data.brief.sizeHint || '規模未設定' }}
        </p>
        <div class="mt-4 grid gap-4 md:grid-cols-3">
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p class="font-semibold text-slate-800">期待工数</p>
            <p class="mt-1 text-lg font-semibold text-slate-900">{{ data.estimate?.expectedHours?.toFixed(1) || '-' }}h</p>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p class="font-semibold text-slate-800">見積金額</p>
            <p class="mt-1 text-lg font-semibold text-emerald-600">
              {{ data.estimate ? `¥${Math.round(data.estimate.sellPrice).toLocaleString('ja-JP')}` : '-' }}
            </p>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p class="font-semibold text-slate-800">粗利率</p>
            <p class="mt-1 text-lg font-semibold text-slate-900">
              {{ data.estimate ? `${(data.estimate.grossMargin * 100).toFixed(1)}%` : '-' }}
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900">主要要件</h3>
        <ul class="mt-3 space-y-3">
          <li v-for="item in data.spec.functional" :key="item.name" class="rounded-lg bg-slate-50 p-4">
            <p class="font-semibold text-slate-900">{{ item.name }}</p>
            <p class="mt-1 text-sm text-slate-600">{{ item.desc }}</p>
          </li>
        </ul>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900">非機能・リスク</h3>
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <h4 class="text-sm font-semibold text-slate-700">非機能要件</h4>
            <ul class="mt-2 space-y-2 text-sm text-slate-600">
              <li v-for="item in data.spec.nonFunctional" :key="item.name">
                {{ item.name }}: {{ item.metric }} {{ item.threshold }}
              </li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-slate-700">リスクと対応</h4>
            <ul class="mt-2 space-y-2 text-sm text-slate-600">
              <li v-for="item in data.spec.risks" :key="item.desc">
                <p class="font-medium text-slate-800">{{ item.desc }}</p>
                <p class="text-xs text-slate-500">Mitigation: {{ item.mitigation }}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useRoute } from '#imports';

const route = useRoute();
const token = route.query.token;

const { data, error } = await useAsyncData('shareBrief', async () => {
  if (typeof token !== 'string') {
    throw new Error('token is required');
  }
  return $fetch(`/api/share/${route.params.id}`, { query: { token } });
});

useHead({ title: data.value?.brief.title ? `${data.value.brief.title} | Brief2Plan共有` : '共有リンク | Brief2Plan' });
</script>
