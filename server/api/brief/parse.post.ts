import { z } from 'zod';

import { generateStructuredSpec, generateWorkBreakdown } from '~/server/services/brief2plan/llm';
import { prisma } from '~/server/utils/prisma';
import { useLogger } from '~/server/utils/logger';

const schema = z.object({
  rawText: z.string().min(20, '要件を詳しく入力してください。'),
  industry: z.string().optional(),
  sizeHint: z.enum(['小規模', '中規模', '大規模']).optional(),
  ratePerHour: z.number().min(1000),
  marginRate: z.number().min(0),
  bufferRate: z.number().min(0),
  targetDeadline: z.string().datetime().optional(),
  title: z.string().optional()
});

const deriveTitle = (rawText: string) => {
  const firstLine = rawText.split(/\n|。/).map((line) => line.trim()).filter(Boolean)[0];
  return firstLine?.slice(0, 60) || '新規案件';
};

export default defineEventHandler(async (event) => {
  const logger = useLogger();
  const body = await readBody(event);
  const parsed = schema.parse(body);

  const config = useRuntimeConfig();

  const brief = await prisma.requirementBrief.create({
    data: {
      title: parsed.title || deriveTitle(parsed.rawText),
      rawText: parsed.rawText,
      industry: parsed.industry,
      sizeHint: parsed.sizeHint,
      ratePerHour: parsed.ratePerHour,
      marginRate: parsed.marginRate,
      bufferRate: parsed.bufferRate,
      targetDeadline: parsed.targetDeadline ? new Date(parsed.targetDeadline) : null
    }
  });

  logger.info({ briefId: brief.id }, 'Requirement brief created');

  const spec = await generateStructuredSpec(
    { rawText: parsed.rawText, industry: parsed.industry },
    config.openaiApiKey
  );
  const wbs = await generateWorkBreakdown(
    { spec, sizeHint: parsed.sizeHint },
    config.openaiApiKey
  );

  await prisma.structuredSpec.create({
    data: {
      briefId: brief.id,
      functional: spec.functional,
      nonFunctional: spec.nonFunctional,
      assumptions: spec.assumptions,
      risks: spec.risks
    }
  });

  await prisma.$transaction(async (tx) => {
    for (const task of wbs) {
      await tx.task.create({
        data: {
          id: task.id,
          briefId: brief.id,
          parentId: task.parentId,
          name: task.name,
          description: task.description,
          optimisticH: task.optimisticH,
          mostLikelyH: task.mostLikelyH,
          pessimisticH: task.pessimisticH,
          dependsOn: task.dependsOn,
          assigneeHint: task.assigneeHint,
          workType: task.workType
        }
      });
    }
  });

  return { briefId: brief.id };
});
