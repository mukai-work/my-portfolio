<template>
  <NuxtLink
    :to="to"
    class="bg-white border-t-4 border-orange-400 shadow-md p-6 rounded-xl hover:bg-orange-50 hover:-translate-y-1 hover:shadow-xl transition-transform transform flex justify-between items-center"
  >
    <div>
      <h2 class="text-xl font-semibold">{{ title }}</h2>
      <p class="text-sm text-gray-500 mt-1">{{ summary }}</p>
    </div>
    <span aria-hidden="true" class="text-orange-400 text-2xl">→</span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ to: string; title: string; summary: string }>();
</script>
