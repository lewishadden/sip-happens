import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

import { JWT_MAX_AGE_SECONDS } from './constants';
import { getUserByEmail } from './db';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
const COOKIE_NAME = 'sip-happens-token';

export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getUserByEmail(email);
  if (!user) return { success: false, error: 'Invalid credentials' };

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return { success: false, error: 'Invalid credentials' };

  const token = await new SignJWT({ userId: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: JWT_MAX_AGE_SECONDS,
    path: '/',
  });

  return { success: true };
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<{
  userId: number;
  email: string;
  name: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { userId: number; email: string; name: string };
  } catch {
    return null;
  }
}
