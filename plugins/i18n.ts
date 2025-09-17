import { createI18n } from 'vue-i18n';

const messages = {
  ja: {
    brief2plan: {
      title: 'Brief2Plan',
      subtitle: '要件整理からWBS・見積までを自動化'
    }
  },
  en: {
    brief2plan: {
      title: 'Brief2Plan',
      subtitle: 'Automate requirement analysis to estimation'
    }
  }
};

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = createI18n({
    legacy: false,
    locale: 'ja',
    fallbackLocale: 'en',
    messages
  });

  nuxtApp.vueApp.use(i18n);
});
