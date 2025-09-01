<template>
  <div class="p-4">
    <h1 class="text-2xl mb-4">Board {{ id }}</h1>
    <p>リアルタイムカンバンPWAの準備中...</p>
  </div>
</template>

<script setup lang="ts">
const { id } = useRoute().params
</script>
