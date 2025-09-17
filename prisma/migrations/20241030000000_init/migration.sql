-- CreateTable
CREATE TABLE "RequirementBrief" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "industry" TEXT,
    "sizeHint" TEXT,
    "ratePerHour" REAL NOT NULL,
    "marginRate" REAL NOT NULL,
    "bufferRate" REAL NOT NULL,
    "targetDeadline" DATETIME
);

-- CreateTable
CREATE TABLE "StructuredSpec" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "briefId" TEXT NOT NULL,
    "functional" TEXT NOT NULL,
    "nonFunctional" TEXT NOT NULL,
    "assumptions" TEXT NOT NULL,
    "risks" TEXT NOT NULL,
    CONSTRAINT "StructuredSpec_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "RequirementBrief" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "StructuredSpec_briefId_key" ON "StructuredSpec"("briefId");

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "briefId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "optimisticH" REAL NOT NULL,
    "mostLikelyH" REAL NOT NULL,
    "pessimisticH" REAL NOT NULL,
    "dependsOn" TEXT NOT NULL,
    "assigneeHint" TEXT,
    "workType" TEXT NOT NULL,
    CONSTRAINT "Task_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "RequirementBrief" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EstimateSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "briefId" TEXT NOT NULL,
    "expectedHours" REAL NOT NULL,
    "stdDevHours" REAL NOT NULL,
    "criticalPath" TEXT NOT NULL,
    "costPrice" REAL NOT NULL,
    "sellPrice" REAL NOT NULL,
    "grossMargin" REAL NOT NULL,
    "mcP50Date" DATETIME,
    "mcP80Date" DATETIME,
    "mcHistogram" TEXT NOT NULL,
    "mcProbabilityByTarget" REAL,
    CONSTRAINT "EstimateSummary_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "RequirementBrief" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EstimateSummary_briefId_key" ON "EstimateSummary"("briefId");

-- CreateTable
CREATE TABLE "ShareToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "briefId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "ShareToken_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "RequirementBrief" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
