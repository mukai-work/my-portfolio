export default defineNuxtConfig({
  ssr: true,
  target: 'static',
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
})
