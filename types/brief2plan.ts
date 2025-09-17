export interface StructuredFunctionalItem {
  name: string;
  desc: string;
  acceptance: string;
}

export interface StructuredNonFunctionalItem {
  name: string;
  metric: string;
  threshold: string;
}

export interface StructuredRiskItem {
  desc: string;
  mitigation: string;
}

export interface StructuredSpecPayload {
  functional: StructuredFunctionalItem[];
  nonFunctional: StructuredNonFunctionalItem[];
  assumptions: string[];
  risks: StructuredRiskItem[];
}

export type WorkCategory = 'DISCOVERY' | 'DESIGN' | 'DEVELOPMENT' | 'QA' | 'PM';

export interface GeneratedTaskInput {
  id: string;
  parentId: string | null;
  name: string;
  description: string;
  optimisticH: number;
  mostLikelyH: number;
  pessimisticH: number;
  dependsOn: string[];
  assigneeHint?: string;
  workType: WorkCategory;
}

export interface CriticalPathNode {
  id: string;
  name: string;
  start: number;
  finish: number;
  expectedHours: number;
}

export interface MonteCarloHistogramBin {
  label: string;
  value: number;
  hours: number;
}

export interface MonteCarloResult {
  durations: number[];
  histogram: MonteCarloHistogramBin[];
  p50Hours: number;
  p80Hours: number;
  probabilityByTarget: number;
}

export interface BriefRecord {
  id: string;
  title: string;
  industry?: string | null;
  sizeHint?: string | null;
  ratePerHour: number;
  marginRate: number;
  bufferRate: number;
  targetDeadline?: string | null;
  createdAt: string;
}

export interface TaskRecord extends GeneratedTaskInput {
  briefId: string;
}

export interface EstimateSummaryResponse {
  expectedHours: number;
  stdDevHours: number;
  criticalPath: CriticalPathNode[];
  costPrice: number;
  sellPrice: number;
  grossMargin: number;
  mcP50Date: string | null;
  mcP80Date: string | null;
  histogram: MonteCarloHistogramBin[];
  probabilityByTarget: number;
  iterations: number;
}
