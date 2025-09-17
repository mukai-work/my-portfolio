import { createError } from 'h3';
import { z } from 'zod';

import { createShareLink } from '~/server/services/brief2plan/share';
import { prisma } from '~/server/utils/prisma';

const schema = z.object({ ttlHours: z.number().min(1).max(24 * 30) });

export default defineEventHandler(async (event) => {
  const params = event.context.params;
  if (!params?.id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' });
  }

  const body = await readBody(event);
  const { ttlHours } = schema.parse(body);
  const config = useRuntimeConfig();

  const brief = await prisma.requirementBrief.findUnique({ where: { id: params.id } });
  if (!brief) {
    throw createError({ statusCode: 404, statusMessage: 'brief not found' });
  }

  const { publicUrl, expiresAt } = await createShareLink({
    briefId: brief.id,
    ttlHours,
    secret: config.jwtSecret,
    baseUrl: config.public.shareBaseUrl || config.shareBaseUrl
  });

  return { publicUrl, expiresAt };
});
