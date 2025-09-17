<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  const root = document.documentElement;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  root.setAttribute('data-theme', mq.matches ? 'dark' : 'light');
  mq.addEventListener?.('change', (event) => {
    root.setAttribute('data-theme', event.matches ? 'dark' : 'light');
  });
  window.addEventListener('scroll', () => {
    document.querySelector('.nav')?.classList.toggle('is-scrolled', window.scrollY > 4);
  });
});
</script>

<template>
  <NuxtLayout>
    <a class="sr-only focus:not-sr-only" href="#content">本文へスキップ</a>
    <NuxtPage />
  </NuxtLayout>
</template>
