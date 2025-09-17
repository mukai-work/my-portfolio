import { createError } from 'h3';
import { z } from 'zod';

import { computePert } from '~/server/services/brief2plan/pert';
import { prisma } from '~/server/utils/prisma';

const bodySchema = z.object({ iterations: z.number().min(100).max(5000).optional() });

export default defineEventHandler(async (event) => {
  const params = event.context.params;
  if (!params?.id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' });
  }

  const body = await readBody(event).catch(() => ({}));
  const parsedBody = bodySchema.safeParse(body);

  const brief = await prisma.requirementBrief.findUnique({
    where: { id: params.id },
    include: { tasks: true }
  });

  if (!brief) {
    throw createError({ statusCode: 404, statusMessage: 'brief not found' });
  }

  const tasks = brief.tasks.map((task) => ({
    id: task.id,
    parentId: task.parentId,
    name: task.name,
    description: task.description,
    optimisticH: task.optimisticH,
    mostLikelyH: task.mostLikelyH,
    pessimisticH: task.pessimisticH,
    dependsOn: Array.isArray(task.dependsOn) ? (task.dependsOn as string[]) : [],
    workType: task.workType,
    assigneeHint: task.assigneeHint
  }));

  const iterations = parsedBody.success && parsedBody.data.iterations ? parsedBody.data.iterations : 1000;

  const pert = computePert({
    tasks,
    startDate: brief.createdAt,
    targetDeadline: brief.targetDeadline,
    iterations
  });

  const expectedHours = pert.expectedHours;
  const costPrice = expectedHours * brief.ratePerHour;
  const sellPrice = costPrice * (1 + brief.marginRate) * (1 + brief.bufferRate);
  const grossMargin = sellPrice === 0 ? 0 : (sellPrice - costPrice) / sellPrice;

  const p50Date = new Date(brief.createdAt.getTime() + pert.monteCarlo.p50Hours * 60 * 60 * 1000);
  const p80Date = new Date(brief.createdAt.getTime() + pert.monteCarlo.p80Hours * 60 * 60 * 1000);

  await prisma.estimateSummary.upsert({
    where: { briefId: brief.id },
    update: {
      expectedHours,
      stdDevHours: pert.stdDevHours,
      criticalPath: pert.criticalPath,
      costPrice,
      sellPrice,
      grossMargin,
      mcP50Date: p50Date,
      mcP80Date: p80Date,
      mcHistogram: pert.monteCarlo.histogram,
      mcProbabilityByTarget: pert.monteCarlo.probabilityByTarget
    },
    create: {
      briefId: brief.id,
      expectedHours,
      stdDevHours: pert.stdDevHours,
      criticalPath: pert.criticalPath,
      costPrice,
      sellPrice,
      grossMargin,
      mcP50Date: p50Date,
      mcP80Date: p80Date,
      mcHistogram: pert.monteCarlo.histogram,
      mcProbabilityByTarget: pert.monteCarlo.probabilityByTarget
    }
  });

  return {
    expectedHours,
    stdDevHours: pert.stdDevHours,
    criticalPath: pert.criticalPath,
    costPrice,
    sellPrice,
    grossMargin,
    mcP50Date: p50Date,
    mcP80Date: p80Date,
    histogram: pert.monteCarlo.histogram,
    probabilityByTarget: pert.monteCarlo.probabilityByTarget,
    iterations
  };
});
