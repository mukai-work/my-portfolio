import type { SignupPayload, User } from '~/types/user';

const users: User[] = [];

export default defineEventHandler(async (event) => {
  const body = await readBody<SignupPayload>(event);
  const { name, email, password } = body;

  if (!name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' });
  }

  const user: User = { id: Date.now(), name, email, password };
  users.push(user);
  console.log('Registered user', user);

  return { success: true };
});
