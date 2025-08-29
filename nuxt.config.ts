export default defineNuxtConfig({
  ssr: true,
  target: 'static',
  app: {
    baseURL: '/my-portfolio/',
    head: {
      script: [{ src: 'https://cdn.tailwindcss.com' }]
    }
  }
})
