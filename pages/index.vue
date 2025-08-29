<template>
  <main class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-3xl mx-auto text-center">
      <h1 class="text-4xl font-bold">ムカイ / Mukai</h1>
      <p class="text-gray-600 mt-2">Nuxt × TypeScript のフリーランスエンジニア</p>
      <div class="mt-4 flex justify-center space-x-6">
        <NuxtLink
          to="/contact"
          class="text-blue-500 underline"
        >
          お問い合わせ
        </NuxtLink>
        <NuxtLink
          to="/board"
          class="text-blue-500 underline"
        >
          掲示板
        </NuxtLink>
      </div>

      <div class="mt-10 grid gap-6 grid-cols-1 sm:grid-cols-2">
        <NuxtLink
          to="/projects/weathermood"
          class="bg-white shadow-md p-6 rounded-xl hover:shadow-xl transition"
        >
          <h2 class="text-xl font-semibold">WeatherMood</h2>
          <p class="text-sm text-gray-500 mt-1">天気×気分UIで魅せるTypeScript作品</p>
        </NuxtLink>

        <NuxtLink
          to="/projects/pokemon"
          class="bg-white shadow-md p-6 rounded-xl hover:shadow-xl transition"
        >
          <h2 class="text-xl font-semibold">ポケカ在庫管理</h2>
          <p class="text-sm text-gray-500 mt-1">SQLite×TSでローカル管理アプリ</p>
        </NuxtLink>
      </div>
    </div>
  </main>
</template>
