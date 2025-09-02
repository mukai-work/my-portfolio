<script setup lang="ts">
import '~/assets/css/tokens.css'
import '~/assets/css/base.css'

onMounted(() => {
  const root = document.documentElement
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  root.setAttribute('data-theme', mq.matches ? 'dark' : 'light')
  mq.addEventListener?.('change', e => root.setAttribute('data-theme', e.matches ? 'dark':'light'))
  window.addEventListener('scroll', () => {
    document.querySelector('.nav')?.classList.toggle('is-scrolled', window.scrollY>4)
  })
})

useHead({
  script: [{ src: 'https://cdn.tailwindcss.com' }]
})
</script>

<template>
  <NuxtLayout>
    <a class="visually-hidden-focusable" href="#content">本文へスキップ</a>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
.visually-hidden-focusable{ position:absolute; left:-9999px; top:auto; width:1px; height:1px; overflow:hidden; }
.visually-hidden-focusable:focus{ position:static; width:auto; height:auto; padding:8px; background:var(--accent); color:var(--accent-contrast); }
</style>
