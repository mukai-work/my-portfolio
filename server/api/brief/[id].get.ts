import { createError } from 'h3';

import { prisma } from '~/server/utils/prisma';
import type { StructuredSpecPayload } from '~/types/brief2plan';

export default defineEventHandler(async (event) => {
  const params = event.context.params;
  if (!params?.id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' });
  }

  const brief = await prisma.requirementBrief.findUnique({
    where: { id: params.id },
    include: { structuredSpec: true, tasks: true, estimate: true }
  });

  if (!brief || !brief.structuredSpec) {
    throw createError({ statusCode: 404, statusMessage: 'brief not found' });
  }

  const spec: StructuredSpecPayload = {
    functional: brief.structuredSpec.functional as StructuredSpecPayload['functional'],
    nonFunctional: brief.structuredSpec.nonFunctional as StructuredSpecPayload['nonFunctional'],
    assumptions: brief.structuredSpec.assumptions as StructuredSpecPayload['assumptions'],
    risks: brief.structuredSpec.risks as StructuredSpecPayload['risks']
  };

  const tasks = brief.tasks.map((task) => ({
    id: task.id,
    briefId: task.briefId,
    parentId: task.parentId,
    name: task.name,
    description: task.description,
    optimisticH: task.optimisticH,
    mostLikelyH: task.mostLikelyH,
    pessimisticH: task.pessimisticH,
    dependsOn: Array.isArray(task.dependsOn) ? (task.dependsOn as string[]) : [],
    assigneeHint: task.assigneeHint,
    workType: task.workType
  }));

  return {
    brief,
    spec,
    tasks,
    estimate: brief.estimate
  };
});
