import type { LoginCredentials, LoginResponse } from '~/types/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body as Partial<LoginCredentials>;

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' });
  }

  // Simple credential check; in real application use proper authentication
  if (email === 'user@example.com' && password === 'password') {
    const token = 'dummy-token';
    setCookie(event, 'token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });
    const res: LoginResponse = { token };
    return res;
  }

  throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
});
