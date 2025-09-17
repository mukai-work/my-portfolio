export default defineNuxtConfig({
  ssr: true,
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/tailwind.css', '~/assets/css/base.css', '~/assets/css/tokens.css'],
  app: {
    baseURL: '/my-portfolio/',
    head: {
      titleTemplate: (titleChunk?: string) =>
        titleChunk ? `${titleChunk} | Kengo Mukai Portfolio` : 'Kengo Mukai Portfolio',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/my-portfolio/favicon.ico' }]
    }
  },
  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    contactEmail: process.env.CONTACT_EMAIL || 'k.mukai.work@gmail.com',
    contactSender: process.env.CONTACT_SENDER || 'noreply@portfolio.dev',
    recaptchaSecret: process.env.RECAPTCHA_SECRET,
    openaiApiKey: process.env.OPENAI_API_KEY,
    githubToken: process.env.GITHUB_TOKEN,
    jwtSecret: process.env.JWT_SECRET || 'brief2plan-dev-secret',
    shareBaseUrl: process.env.SHARE_BASE_URL || 'http://localhost:3000',
    pinoLevel: process.env.LOG_LEVEL || 'info',
    public: {
      recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || '',
      githubEnabled: Boolean(process.env.GITHUB_TOKEN),
      shareBaseUrl: process.env.SHARE_BASE_URL || 'http://localhost:3000',
      defaultRatePerHour: Number.parseInt(process.env.DEFAULT_RATE_PER_HOUR || '12000', 10),
      locales: ['ja', 'en']
    }
  },
  typescript: {
    strict: true,
    shim: false
  },
  compatibilityDate: '2024-12-01',
  nitro: {
    preset: 'node-server',
    routeRules: {
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'Referrer-Policy': 'no-referrer-when-downgrade',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
      }
    }
  }
});
