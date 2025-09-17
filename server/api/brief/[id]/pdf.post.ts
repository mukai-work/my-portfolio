import { createError } from 'h3';

import { generateEstimatePdf } from '~/server/services/brief2plan/pdf';
import { prisma } from '~/server/utils/prisma';
import type { StructuredSpecPayload, CriticalPathNode } from '~/types/brief2plan';

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

  const structured = brief.structuredSpec;
  const specPayload: StructuredSpecPayload = {
    functional: structured.functional as StructuredSpecPayload['functional'],
    nonFunctional: structured.nonFunctional as StructuredSpecPayload['nonFunctional'],
    assumptions: structured.assumptions as StructuredSpecPayload['assumptions'],
    risks: structured.risks as StructuredSpecPayload['risks']
  };

  const pdf = await generateEstimatePdf({
    brief,
    spec: specPayload,
    tasks: brief.tasks,
    estimate: brief.estimate
      ? {
          expectedHours: brief.estimate.expectedHours,
          stdDevHours: brief.estimate.stdDevHours,
          costPrice: brief.estimate.costPrice,
          sellPrice: brief.estimate.sellPrice,
          grossMargin: brief.estimate.grossMargin,
          criticalPath: brief.estimate.criticalPath as unknown as CriticalPathNode[],
          probabilityByTarget: brief.estimate.mcProbabilityByTarget ?? undefined
        }
      : null
  });

  setHeader(event, 'Content-Type', 'application/pdf');
  setHeader(event, 'Content-Disposition', `attachment; filename="brief-${brief.id}.pdf"`);
  return pdf;
});
