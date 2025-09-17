import { createError, getQuery } from 'h3';

import { verifyShareToken } from '~/server/services/brief2plan/share';
import { prisma } from '~/server/utils/prisma';
import type { StructuredSpecPayload } from '~/types/brief2plan';

export default defineEventHandler(async (event) => {
  const params = event.context.params;
  if (!params?.id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' });
  }
  const { token } = getQuery(event);
  if (typeof token !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'token is required' });
  }

  const config = useRuntimeConfig();
  const payload = await verifyShareToken({ shareId: params.id, token, secret: config.jwtSecret });
  if (!payload) {
    throw createError({ statusCode: 403, statusMessage: '共有リンクの期限が切れています。' });
  }

  const brief = await prisma.requirementBrief.findUnique({
    where: { id: payload.briefId },
    include: { structuredSpec: true, estimate: true }
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

  return {
    brief: {
      id: brief.id,
      title: brief.title,
      industry: brief.industry,
      sizeHint: brief.sizeHint,
      targetDeadline: brief.targetDeadline,
      marginRate: brief.marginRate,
      bufferRate: brief.bufferRate,
      ratePerHour: brief.ratePerHour
    },
    spec,
    estimate: brief.estimate
      ? {
          expectedHours: brief.estimate.expectedHours,
          sellPrice: brief.estimate.sellPrice,
          grossMargin: brief.estimate.grossMargin,
          mcP50Date: brief.estimate.mcP50Date,
          mcP80Date: brief.estimate.mcP80Date,
          probabilityByTarget: brief.estimate.mcProbabilityByTarget
        }
      : null
  };
});
