import { describe, expect, it } from 'vitest';

import { WorkType } from '@prisma/client';

import { computePert } from '~/server/services/brief2plan/pert';
import type { GeneratedTaskInput } from '~/types/brief2plan';

const sampleTasks: GeneratedTaskInput[] = [
  {
    id: 'kickoff',
    parentId: null,
    name: 'キックオフ',
    description: 'ステークホルダー調整',
    optimisticH: 4,
    mostLikelyH: 6,
    pessimisticH: 10,
    dependsOn: [],
    workType: WorkType.PM
  },
  {
    id: 'design',
    parentId: null,
    name: '設計',
    description: '仕様整理と設計',
    optimisticH: 8,
    mostLikelyH: 12,
    pessimisticH: 18,
    dependsOn: ['kickoff'],
    workType: WorkType.DESIGN
  },
  {
    id: 'implementation',
    parentId: null,
    name: '実装',
    description: '開発作業',
    optimisticH: 16,
    mostLikelyH: 24,
    pessimisticH: 40,
    dependsOn: ['design'],
    workType: WorkType.DEVELOPMENT
  },
  {
    id: 'qa',
    parentId: null,
    name: 'QA',
    description: '受入テスト',
    optimisticH: 6,
    mostLikelyH: 10,
    pessimisticH: 16,
    dependsOn: ['implementation'],
    workType: WorkType.QA
  }
];

describe('PERT calculation', () => {
  it('calculates expected hours and critical path', () => {
    const result = computePert({
      tasks: sampleTasks,
      startDate: new Date('2024-01-01T00:00:00Z'),
      targetDeadline: new Date('2024-01-20T00:00:00Z'),
      iterations: 500
    });

    expect(result.expectedHours).toBeGreaterThan(30);
    expect(result.stdDevHours).toBeGreaterThan(0);
    expect(result.criticalPath.map((node) => node.id)).toEqual([
      'kickoff',
      'design',
      'implementation',
      'qa'
    ]);
    expect(result.monteCarlo.histogram.length).toBeGreaterThan(0);
    expect(result.monteCarlo.probabilityByTarget).toBeGreaterThanOrEqual(0);
  });
});
