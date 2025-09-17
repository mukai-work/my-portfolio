export default defineEventHandler((event) => {
  setHeader(event, 'X-DNS-Prefetch-Control', 'off');
  setHeader(event, 'X-Download-Options', 'noopen');
  setHeader(event, 'X-Permitted-Cross-Domain-Policies', 'none');
  setHeader(event, 'Cross-Origin-Embedder-Policy', 'require-corp');
  setHeader(event, 'Cross-Origin-Opener-Policy', 'same-origin');
  setHeader(event, 'Cross-Origin-Resource-Policy', 'same-origin');
});
