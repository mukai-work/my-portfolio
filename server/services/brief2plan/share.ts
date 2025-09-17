import { createHash, randomBytes } from 'node:crypto';

import jwt from 'jsonwebtoken';

import { prisma } from '~/server/utils/prisma';

export const generateShareId = () => randomBytes(4).toString('hex');

export const createShareLink = async (options: {
  briefId: string;
  ttlHours: number;
  secret: string;
  baseUrl: string;
}) => {
  const { briefId, ttlHours, secret, baseUrl } = options;
  const shareId = generateShareId();
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  const token = jwt.sign({ briefId, shareId }, secret, { expiresIn: `${ttlHours}h` });
  const hashed = createHash('sha256').update(token).digest('hex');

  await prisma.shareToken.create({
    data: {
      id: shareId,
      briefId,
      token: hashed,
      expiresAt
    }
  });

  const publicUrl = `${baseUrl.replace(/\/$/, '')}/brief2plan/share/${shareId}?token=${encodeURIComponent(token)}`;
  return { publicUrl, expiresAt };
};

export const verifyShareToken = async (options: { shareId: string; token: string; secret: string }) => {
  const { shareId, token, secret } = options;
  const record = await prisma.shareToken.findUnique({ where: { id: shareId } });
  if (!record) {
    return null;
  }
  if (record.expiresAt.getTime() < Date.now()) {
    return null;
  }

  try {
    const payload = jwt.verify(token, secret) as { briefId: string; shareId: string };
    const hashed = createHash('sha256').update(token).digest('hex');
    if (payload.shareId !== shareId || hashed !== record.token) {
      return null;
    }
    return payload;
  } catch (error) {
    console.error('Failed to verify share token', error);
    return null;
  }
};
