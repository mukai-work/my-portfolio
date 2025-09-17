import { WorkType } from '@prisma/client';
import OpenAI from 'openai';
import { z } from 'zod';

import type { GeneratedTaskInput, StructuredSpecPayload } from '~/types/brief2plan';

const specSchema = z.object({
  functional: z
    .array(
      z.object({
        name: z.string(),
        desc: z.string(),
        acceptance: z.string()
      })
    )
    .min(1),
  nonFunctional: z.array(z.object({ name: z.string(), metric: z.string(), threshold: z.string() })),
  assumptions: z.array(z.string()),
  risks: z.array(z.object({ desc: z.string(), mitigation: z.string() }))
});

const wbsSchema = z.array(
  z.object({
    id: z.string(),
    parentId: z.string().nullable(),
    name: z.string(),
    description: z.string(),
    optimisticH: z.number(),
    mostLikelyH: z.number(),
    pessimisticH: z.number(),
    dependsOn: z.array(z.string()),
    assigneeHint: z.string().optional(),
    workType: z.nativeEnum(WorkType)
  })
);

const sizeScaleMap: Record<string, number> = {
  小規模: 0.85,
  中規模: 1,
  大規模: 1.35
};

const sanitizeJson = (raw: string) => {
  const trimmed = raw.trim();
  const start = trimmed.indexOf('{');
  const arrStart = trimmed.indexOf('[');
  if (start === -1 && arrStart === -1) {
    throw new Error('LLM response does not contain JSON');
  }
  const actualStart = start === -1 ? arrStart : start < arrStart || arrStart === -1 ? start : arrStart;
  const end = trimmed.lastIndexOf(actualStart === start ? '}' : ']');
  if (end === -1) {
    throw new Error('LLM response missing closing bracket');
  }
  return trimmed.slice(actualStart, end + 1);
};

const bulletRegex = /(?:^|\n)[\-*・]\s*(.+)/g;

const fallbackFunctional = (rawText: string) => {
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = bulletRegex.exec(rawText)) !== null) {
    matches.push(match[1].trim());
  }
  if (matches.length === 0) {
    const sentences = rawText.split(/\n|。|\./).map((value) => value.trim()).filter(Boolean);
    matches.push(...sentences.slice(0, 4));
  }
  return matches.slice(0, 12).map((name, index) => ({
    name,
    desc: `${name} を実現するための詳細仕様を固める`,
    acceptance: `${name} が主要ユースケースで利用できる`
  }));
};

const fallbackSpec = (rawText: string): StructuredSpecPayload => {
  const functional = fallbackFunctional(rawText);
  return {
    functional,
    nonFunctional: [
      { name: 'Performance', metric: 'ページ応答時間', threshold: '< 2 秒' },
      { name: 'Security', metric: 'OWASP ASVS', threshold: 'レベル2順守' },
      { name: 'Availability', metric: '稼働率', threshold: '99.5% 以上' }
    ],
    assumptions: [
      '既存クラウドインフラを活用',
      'キーユーザー3〜5名が要件定義に参加',
      '主要APIは提供済み'
    ],
    risks: [
      { desc: 'スコープ膨張による遅延', mitigation: 'スプリントごとにバックログを精査' },
      { desc: '外部API制限', mitigation: '代替手段とキャッシュ戦略を事前検討' },
      { desc: '要件の曖昧さ', mitigation: 'ワークショップでユースケースを明文化' }
    ]
  };
};

const basePhaseTemplates = [
  {
    key: 'discovery',
    label: '要件定義',
    workType: WorkType.DISCOVERY,
    o: 4,
    m: 8,
    p: 12
  },
  {
    key: 'design',
    label: '設計・実装',
    workType: WorkType.DEVELOPMENT,
    o: 12,
    m: 24,
    p: 40
  },
  {
    key: 'qa',
    label: 'QA・受入',
    workType: WorkType.QA,
    o: 6,
    m: 12,
    p: 20
  }
];

const scaleValue = (value: number, sizeHint?: string) => {
  const scale = (sizeHint && sizeScaleMap[sizeHint]) || 1;
  return Number((value * scale).toFixed(2));
};

const fallbackWbs = (spec: StructuredSpecPayload, sizeHint?: string): GeneratedTaskInput[] => {
  const tasks: GeneratedTaskInput[] = [];
  const backlogGroomingId = 'task-backlog';
  tasks.push({
    id: backlogGroomingId,
    parentId: null,
    name: 'バックログ精査と優先度付け',
    description: '要件をプロダクトバックログに落とし込み優先度を決定',
    optimisticH: scaleValue(8, sizeHint),
    mostLikelyH: scaleValue(12, sizeHint),
    pessimisticH: scaleValue(18, sizeHint),
    dependsOn: [],
    workType: WorkType.PM
  });

  spec.functional.forEach((feature, featureIndex) => {
    const featureId = `feature-${featureIndex + 1}`;
    tasks.push({
      id: featureId,
      parentId: null,
      name: feature.name,
      description: feature.desc,
      optimisticH: scaleValue(4, sizeHint),
      mostLikelyH: scaleValue(6, sizeHint),
      pessimisticH: scaleValue(10, sizeHint),
      dependsOn: [backlogGroomingId],
      workType: WorkType.PM
    });

    let previousPhaseId: string | null = featureId;
    basePhaseTemplates.forEach((phase, phaseIndex) => {
      const phaseId = `${featureId}-${phase.key}`;
      const dependsOn = phaseIndex === 0 ? [featureId] : previousPhaseId ? [previousPhaseId] : [];
      tasks.push({
        id: phaseId,
        parentId: featureId,
        name: `${feature.name} - ${phase.label}`,
        description: `${feature.desc} に対する ${phase.label}`,
        optimisticH: scaleValue(phase.o, sizeHint),
        mostLikelyH: scaleValue(phase.m, sizeHint),
        pessimisticH: scaleValue(phase.p, sizeHint),
        dependsOn,
        workType: phase.workType
      });
      previousPhaseId = phaseId;
    });

    const qaId = `${featureId}-qa`; // last entry for clarity
    const handoverId = `${featureId}-handover`;
    tasks.push({
      id: handoverId,
      parentId: featureId,
      name: `${feature.name} - リリース準備`,
      description: `${feature.name} の手順書・運用設計`,
      optimisticH: scaleValue(4, sizeHint),
      mostLikelyH: scaleValue(6, sizeHint),
      pessimisticH: scaleValue(10, sizeHint),
      dependsOn: [qaId],
      workType: WorkType.QA
    });
  });

  const cutoverId = 'task-cutover';
  tasks.push({
    id: cutoverId,
    parentId: null,
    name: '全体結合テストと移行',
    description: '横断機能の結合テスト、リリース計画、データ移行',
    optimisticH: scaleValue(12, sizeHint),
    mostLikelyH: scaleValue(20, sizeHint),
    pessimisticH: scaleValue(32, sizeHint),
    dependsOn: spec.functional.map((_, index) => `feature-${index + 1}-handover`),
    workType: WorkType.DEVELOPMENT
  });

  tasks.push({
    id: 'task-retro',
    parentId: null,
    name: '振り返りとハンドオーバー',
    description: 'リリース後の振り返り、運用チームへの引き継ぎ',
    optimisticH: scaleValue(6, sizeHint),
    mostLikelyH: scaleValue(10, sizeHint),
    pessimisticH: scaleValue(16, sizeHint),
    dependsOn: [cutoverId],
    workType: WorkType.PM
  });

  return tasks;
};

export interface GenerateSpecOptions {
  rawText: string;
  industry?: string;
}

export interface GenerateWbsOptions {
  spec: StructuredSpecPayload;
  sizeHint?: string;
}

export const generateStructuredSpec = async (
  options: GenerateSpecOptions,
  openAiKey?: string
): Promise<StructuredSpecPayload> => {
  if (!openAiKey) {
    return fallbackSpec(options.rawText);
  }

  const client = new OpenAI({ apiKey: openAiKey });
  try {
    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input: `You are a requirements analyst. Normalize the following request (language may be Japanese). Return ONLY JSON with keys functional, nonFunctional, assumptions, risks. Each functional item requires name, desc, acceptance. NonFunctional requires name, metric, threshold. Risks require desc and mitigation. Text: ${options.rawText}`
    });
    const text = response.output_text;
    const parsed = specSchema.parse(JSON.parse(sanitizeJson(text)));
    return parsed;
  } catch (error) {
    console.error('OpenAI structured spec fallback', error);
    return fallbackSpec(options.rawText);
  }
};

export const generateWorkBreakdown = async (
  options: GenerateWbsOptions,
  openAiKey?: string
): Promise<GeneratedTaskInput[]> => {
  if (!openAiKey) {
    return fallbackWbs(options.spec, options.sizeHint);
  }

  const client = new OpenAI({ apiKey: openAiKey });
  try {
    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input: `You are a software delivery planner. Create a hierarchical WBS as JSON array for these features: ${JSON.stringify(
        options.spec.functional
      )}. Each node must include id, parentId, name, description, optimisticH, mostLikelyH, pessimisticH, dependsOn (array of ids), workType (DISCOVERY|DESIGN|DEVELOPMENT|QA|PM). Provide durations in hours and respect size hint: ${
        options.sizeHint || '中規模'
      }. Root level tasks must coordinate discovery, delivery and QA.`
    });
    const text = response.output_text;
    const parsed = wbsSchema.parse(JSON.parse(sanitizeJson(text)));
    if (parsed.length === 0) {
      throw new Error('Empty WBS');
    }
    return parsed;
  } catch (error) {
    console.error('OpenAI WBS fallback', error);
    return fallbackWbs(options.spec, options.sizeHint);
  }
};
