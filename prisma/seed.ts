import { PrismaClient, WorkType } from '@prisma/client';

const prisma = new PrismaClient();

const samples = [
  {
    title: 'SaaS CRM 要件',
    rawText:
      'SaaS向け顧客管理システムを構築したい。・ユーザー管理・案件トラッキング・メール連携・ダッシュボード・権限管理',
    industry: 'SaaS',
    sizeHint: '中規模'
  },
  {
    title: 'ECサイト刷新',
    rawText:
      'ブランドECを刷新。- カタログ閲覧 - カート - 決済(Stripe) - 在庫管理 - レコメンド - レポート',
    industry: 'EC',
    sizeHint: '大規模'
  },
  {
    title: '工事写真共有アプリ',
    rawText:
      '建設現場での写真共有プラットフォーム。・モバイル撮影アップロード・図面との紐付け・承認フロー・レポートPDF',
    industry: '建設',
    sizeHint: '小規模'
  }
];

async function main() {
  await prisma.task.deleteMany();
  await prisma.structuredSpec.deleteMany();
  await prisma.estimateSummary.deleteMany();
  await prisma.shareToken.deleteMany();
  await prisma.requirementBrief.deleteMany();

  for (const sample of samples) {
    await prisma.requirementBrief.create({
      data: {
        title: sample.title,
        rawText: sample.rawText,
        industry: sample.industry,
        sizeHint: sample.sizeHint,
        ratePerHour: 12000,
        marginRate: 0.3,
        bufferRate: 0.15,
        tasks: {
          create: [
            {
              name: 'ヒアリングと要件定義',
              description: 'キックオフ、スコープ定義、成果物確認',
              optimisticH: 8,
              mostLikelyH: 12,
              pessimisticH: 18,
              dependsOn: [],
              workType: WorkType.DISCOVERY
            },
            {
              name: 'プロトタイプ設計',
              description: '主要画面の情報設計とUIプロト作成',
              optimisticH: 12,
              mostLikelyH: 20,
              pessimisticH: 32,
              dependsOn: [],
              workType: WorkType.DESIGN
            }
          ]
        }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
