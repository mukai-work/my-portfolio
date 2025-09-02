export default defineNuxtPlugin((nuxtApp) => {
  if (!('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-inview');
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px' }
  );

  const observe = () => {
    document
      .querySelectorAll('.reveal:not(.is-inview)')
      .forEach((el) => io.observe(el));
  };

  observe();
  nuxtApp.hook('page:finish', observe);
});
