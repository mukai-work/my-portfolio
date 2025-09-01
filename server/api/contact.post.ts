import type { ContactMessage } from '~/types/contact';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { name, email, message, token, botField } = body as Partial<ContactMessage>;

  if (!name || !email || !message || !token) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' });
  }

  if (botField) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' });
  }

  // Verify reCAPTCHA response
  const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: config.recaptchaSecret,
      response: token,
    }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyData.success || (verifyData.score && verifyData.score < 0.5)) {
    throw createError({ statusCode: 400, statusMessage: 'Failed captcha' });
  }

  // Send email via Resend API
  const sendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.contactSender,
      to: config.contactEmail,
      subject: `お問い合わせ from ${name}`,
      text: message,
      reply_to: email,
    }),
  });

  if (!sendRes.ok) {
    console.error('Failed to send email', await sendRes.text());
    throw createError({ statusCode: 500, statusMessage: 'Failed to send message' });
  }

  return { success: true };
});
