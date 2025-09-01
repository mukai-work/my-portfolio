export default defineNuxtConfig({
  ssr: true,
  target: 'static',
  modules: ['@vite-pwa/nuxt'],
  app: {
    baseURL: '/my-portfolio/',
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/my-portfolio/favicon.ico' }
      ]
    }
  },
  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    contactEmail: process.env.CONTACT_EMAIL || 'k.mukai.work@gmail.com',
    contactSender: process.env.CONTACT_SENDER,
    recaptchaSecret: process.env.RECAPTCHA_SECRET,
    public: {
      recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY
    }
  }
  ,
  pwa: {
    manifest: {
      name: 'Realtime Kanban',
      short_name: 'Kanban',
      theme_color: '#f97316',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/my-portfolio/',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  }
})
