import type { RequirementBrief, Task } from '@prisma/client';
import { PDFDocument, StandardFonts } from 'pdf-lib';

import type { StructuredSpecPayload } from '~/types/brief2plan';

interface PdfContext {
  brief: RequirementBrief;
  spec: StructuredSpecPayload;
  tasks: Task[];
  estimate?: {
    expectedHours: number;
    stdDevHours: number;
    costPrice: number;
    sellPrice: number;
    grossMargin: number;
    criticalPath: { id: string; name: string; finish: number }[];
    probabilityByTarget?: number;
  } | null;
}

const createWriter = async (pdfDoc: PDFDocument) => {
  let page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const margin = 48;
  let cursor = page.getHeight() - margin;

  const ensureSpace = (height: number) => {
    if (cursor - height <= margin) {
      page = pdfDoc.addPage([595.28, 841.89]);
      cursor = page.getHeight() - margin;
    }
  };

  const draw = (text: string, options: { size?: number; bold?: boolean; spacing?: number } = {}) => {
    const { size = 12, bold = false, spacing = 12 } = options;
    ensureSpace(spacing + size);
    cursor -= spacing;
    const fontToUse = bold ? fontBold : font;
    page.drawText(text, { x: margin, y: cursor, size, font: fontToUse });
  };

  return { draw };
};

export const generateEstimatePdf = async ({ brief, spec, tasks, estimate }: PdfContext) => {
  const pdfDoc = await PDFDocument.create();
  const writer = await createWriter(pdfDoc);

  writer.draw('Brief2Plan 見積レポート', { size: 18, bold: true, spacing: 0 });
  writer.draw(`案件: ${brief.title}`, { bold: true });
  writer.draw(`入力日時: ${new Date(brief.createdAt).toLocaleString('ja-JP')}`);
  if (brief.targetDeadline) {
    writer.draw(`目標納期: ${new Date(brief.targetDeadline).toLocaleDateString('ja-JP')}`);
  }
  if (brief.industry) {
    writer.draw(`業界: ${brief.industry}`);
  }

  writer.draw('--- 構造化要件 ---', { bold: true, spacing: 24 });
  spec.functional.forEach((item, index) => {
    writer.draw(`${index + 1}. ${item.name}`, { bold: true });
    writer.draw(`  説明: ${item.desc}`);
    writer.draw(`  受入条件: ${item.acceptance}`);
  });

  writer.draw('非機能要件', { bold: true, spacing: 18 });
  spec.nonFunctional.forEach((item) => {
    writer.draw(`- ${item.name}: ${item.metric} ${item.threshold}`);
  });

  writer.draw('前提', { bold: true, spacing: 18 });
  spec.assumptions.forEach((assumption) => {
    writer.draw(`- ${assumption}`);
  });

  writer.draw('リスクと対応', { bold: true, spacing: 18 });
  spec.risks.forEach((risk) => {
    writer.draw(`- ${risk.desc} / 対応: ${risk.mitigation}`);
  });

  writer.draw('--- WBS 概要 ---', { bold: true, spacing: 24 });
  tasks.slice(0, 15).forEach((task, index) => {
    writer.draw(`${index + 1}. ${task.name}`);
    writer.draw(
      `   O/M/P: ${task.optimisticH.toFixed(1)} / ${task.mostLikelyH.toFixed(1)} / ${task.pessimisticH.toFixed(1)} h`
    );
  });
  if (tasks.length > 15) {
    writer.draw(`... ほか ${tasks.length - 15} タスク`);
  }

  if (estimate) {
    writer.draw('--- 見積サマリ ---', { bold: true, spacing: 24 });
    writer.draw(`期待工数: ${estimate.expectedHours.toFixed(1)} h`);
    writer.draw(`標準偏差: ${estimate.stdDevHours.toFixed(2)} h`);
    writer.draw(`原価: ¥${estimate.costPrice.toLocaleString('ja-JP')}`);
    writer.draw(`見積額: ¥${estimate.sellPrice.toLocaleString('ja-JP')} (粗利率 ${(estimate.grossMargin * 100).toFixed(1)}%)`);
    if (estimate.probabilityByTarget !== undefined) {
      writer.draw(`目標納期達成確率: ${estimate.probabilityByTarget.toFixed(1)}%`);
    }
    writer.draw('クリティカルパス', { bold: true, spacing: 18 });
    estimate.criticalPath.forEach((node, index) => {
      writer.draw(`${index + 1}. ${node.name} (終了: ${node.finish.toFixed(1)} h)`);
    });
  }

  const bytes = await pdfDoc.save();
  return bytes;
};
