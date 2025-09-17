import { describe, expect, it } from 'vitest';

import { generateStructuredSpec, generateWorkBreakdown } from '~/server/services/brief2plan/llm';

const sampleText = `
SaaSプロダクトの初期版を開発したい。
・ユーザー登録とログイン
・ダッシュボードでのKPI表示
・請求書PDF出力
・Slack通知
`;

describe('LLM fallback generation', () => {
  it('produces structured spec without OpenAI key', async () => {
    const spec = await generateStructuredSpec({ rawText: sampleText }, undefined);
    expect(spec.functional.length).toBeGreaterThan(0);
    expect(spec.nonFunctional.length).toBeGreaterThan(0);
    expect(spec.risks.length).toBeGreaterThan(0);
  });

  it('produces WBS with hierarchical tasks', async () => {
    const spec = await generateStructuredSpec({ rawText: sampleText }, undefined);
    const tasks = await generateWorkBreakdown({ spec, sizeHint: '中規模' }, undefined);
    expect(tasks.length).toBeGreaterThan(5);
    const child = tasks.find((task) => task.parentId !== null);
    expect(child).toBeDefined();
    expect(Array.isArray(tasks[0].dependsOn)).toBe(true);
  });
});
