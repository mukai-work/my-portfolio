import { createError } from 'h3';
import { z } from 'zod';

import { exportTasksToGithub } from '~/server/services/brief2plan/github';
import { prisma } from '~/server/utils/prisma';

const schema = z.object({ repo: z.string().min(5) });

export default defineEventHandler(async (event) => {
  const params = event.context.params;
  if (!params?.id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' });
  }

  const body = await readBody(event);
  const { repo } = schema.parse(body);
  const config = useRuntimeConfig();

  if (!config.githubToken) {
    throw createError({ statusCode: 400, statusMessage: 'GitHubトークンが設定されていません。' });
  }

  const brief = await prisma.requirementBrief.findUnique({
    where: { id: params.id },
    include: { tasks: true }
  });
  if (!brief) {
    throw createError({ statusCode: 404, statusMessage: 'brief not found' });
  }

  const result = await exportTasksToGithub({
    token: config.githubToken,
    repo,
    brief,
    tasks: brief.tasks
  });

  return result;
});
