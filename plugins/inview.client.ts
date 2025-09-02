export default defineNuxtPlugin(() => {
  if (!('IntersectionObserver' in window)) return
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-inview'); io.unobserve(e.target) } })
  },{ rootMargin: '0px 0px -10% 0px' })
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el))
})
