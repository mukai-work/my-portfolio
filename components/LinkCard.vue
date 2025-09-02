<template>
  <NuxtLink
    :to="to"
    class="card card--hover p-6 flex justify-between items-center"
  >
    <div>
      <h2 class="text-xl font-semibold">{{ title }}</h2>
      <p class="text-sm text-gray-500 mt-1">{{ summary }}</p>
    </div>
    <span aria-hidden="true" class="text-2xl">→</span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ to: string; title: string; summary: string }>();
</script>
