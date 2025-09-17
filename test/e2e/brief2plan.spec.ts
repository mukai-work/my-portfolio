import { expect, test } from '@playwright/test';

test('Brief2Plan happy path', async ({ page }) => {
  await page.goto('/brief2plan');

  await page.getByLabel('要件メモ').fill(`次世代の顧客管理システムを構築したい。
・顧客のCRUD
・案件パイプライン
・ダッシュボード
・レポートPDF
`);
  await page.getByLabel('対象業界').fill('SaaS');
  await page.getByLabel('規模感').selectOption('中規模');
  await page.getByLabel('レート (円/人時)').fill('14000');

  await page.getByRole('button', { name: '解析する' }).click();

  await expect(page.getByText('機能要件')).toBeVisible();
  await expect(page.getByText('WBS ツリー')).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'PDF出力' }).click()
  ]);
  expect(download.suggestedFilename()).toContain('brief');

  await page.getByRole('button', { name: '共有リンク' }).click();
  await page.getByRole('button', { name: '共有リンクを発行' }).click();
  await expect(page.getByText('共有URL')).toBeVisible();
  await page.getByRole('button', { name: 'キャンセル' }).click();

  await page.getByRole('button', { name: 'GitHub連携' }).click();
  await page.getByLabel('リポジトリ').fill('test/sample');
  await page.getByRole('button', { name: 'Issue を作成' }).click();
  await expect(page.getByText('モックモードで成功')).toBeVisible();
});
