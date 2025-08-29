import type { ContactMessage } from '~/types/contact';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, email, message } = body as Partial<ContactMessage>;

  if (!name || !email || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' });
  }

  console.log('Received contact message', { name, email, message });

  return { success: true };
});
