import type { WorkType } from '@prisma/client';

import type {
  CriticalPathNode,
  GeneratedTaskInput,
  MonteCarloHistogramBin,
  MonteCarloResult
} from '~/types/brief2plan';

interface PertTask extends GeneratedTaskInput {
  workType: WorkType;
}

const expectedHours = (task: PertTask) =>
  (task.optimisticH + 4 * task.mostLikelyH + task.pessimisticH) / 6;

const variance = (task: PertTask) => {
  const range = task.pessimisticH - task.optimisticH;
  return (range / 6) ** 2;
};

const triangularSample = (task: PertTask) => {
  const u = Math.random();
  const f = (task.mostLikelyH - task.optimisticH) / (task.pessimisticH - task.optimisticH || 1);
  if (u <= f) {
    return (
      task.optimisticH + Math.sqrt(u * (task.pessimisticH - task.optimisticH) * (task.mostLikelyH - task.optimisticH || 1))
    );
  }
  return (
    task.pessimisticH -
    Math.sqrt((1 - u) * (task.pessimisticH - task.optimisticH) * (task.pessimisticH - task.mostLikelyH || 1))
  );
};

const orderTasks = (tasks: PertTask[]): string[] => {
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  tasks.forEach((task) => {
    inDegree.set(task.id, task.dependsOn.length);
    task.dependsOn.forEach((dependency) => {
      dependents.set(dependency, [...(dependents.get(dependency) || []), task.id]);
    });
  });

  const queue: string[] = [];
  inDegree.forEach((value, key) => {
    if (value === 0) {
      queue.push(key);
    }
  });

  const ordered: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift();
    if (!id) {
      break;
    }
    ordered.push(id);
    const dependentsList = dependents.get(id) || [];
    dependentsList.forEach((dependentId) => {
      const current = inDegree.get(dependentId) ?? 0;
      const next = current - 1;
      inDegree.set(dependentId, next);
      if (next === 0) {
        queue.push(dependentId);
      }
    });
  }

  if (ordered.length !== tasks.length) {
    throw new Error('Detected circular dependency in tasks');
  }

  return ordered;
};

const buildCriticalPath = (tasks: PertTask[]): { path: CriticalPathNode[]; duration: number; variance: number } => {
  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  const order = orderTasks(tasks);
  const earliestStart = new Map<string, number>();
  const earliestFinish = new Map<string, number>();
  const predecessor = new Map<string, string | null>();

  order.forEach((taskId) => {
    const task = tasksById.get(taskId);
    if (!task) {
      return;
    }
    const depsFinish = task.dependsOn.map((dependency) => earliestFinish.get(dependency) ?? 0);
    const start = depsFinish.length ? Math.max(...depsFinish) : 0;
    const finish = start + expectedHours(task);
    earliestStart.set(taskId, start);
    earliestFinish.set(taskId, finish);

    if (task.dependsOn.length > 0) {
      const maxDep = task.dependsOn.reduce((acc, dependency) => {
        const dependencyFinish = earliestFinish.get(dependency) ?? 0;
        if (dependencyFinish > (earliestFinish.get(acc) ?? 0)) {
          return dependency;
        }
        return acc;
      }, task.dependsOn[0]);
      predecessor.set(taskId, maxDep);
    } else {
      predecessor.set(taskId, null);
    }
  });

  let lastTaskId = order[0];
  let maxFinish = 0;
  earliestFinish.forEach((finish, taskId) => {
    if (finish >= maxFinish) {
      maxFinish = finish;
      lastTaskId = taskId;
    }
  });

  const path: CriticalPathNode[] = [];
  let current: string | null = lastTaskId;
  let aggregatedVariance = 0;
  while (current) {
    const task = tasksById.get(current);
    if (!task) {
      break;
    }
    const start = earliestStart.get(current) ?? 0;
    const finish = earliestFinish.get(current) ?? start + expectedHours(task);
    aggregatedVariance += variance(task);
    path.unshift({
      id: current,
      name: task.name,
      start,
      finish,
      expectedHours: expectedHours(task)
    });
    current = predecessor.get(current) ?? null;
  }

  return { path, duration: maxFinish, variance: aggregatedVariance };
};

const buildHistogram = (durations: number[], bins = 10): MonteCarloHistogramBin[] => {
  if (durations.length === 0) {
    return [];
  }
  const min = Math.min(...durations);
  const max = Math.max(...durations);
  const range = max - min || 1;
  const size = range / bins;
  const histogram: MonteCarloHistogramBin[] = [];
  for (let i = 0; i < bins; i += 1) {
    const lower = min + i * size;
    const upper = i === bins - 1 ? max : lower + size;
    histogram.push({
      label: `${lower.toFixed(1)}h - ${upper.toFixed(1)}h`,
      value: 0,
      hours: (lower + upper) / 2
    });
  }
  durations.forEach((duration) => {
    const index = Math.min(
      histogram.length - 1,
      Math.floor(((duration - min) / range) * bins)
    );
    histogram[index].value += 1;
  });
  return histogram.map((bin) => ({ ...bin, value: Number(((bin.value / durations.length) * 100).toFixed(2)) }));
};

const percentile = (sortedDurations: number[], p: number) => {
  if (sortedDurations.length === 0) {
    return 0;
  }
  const index = (sortedDurations.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) {
    return sortedDurations[lower];
  }
  return sortedDurations[lower] + (sortedDurations[upper] - sortedDurations[lower]) * (index - lower);
};

export interface PertComputationInput {
  tasks: PertTask[];
  startDate: Date;
  targetDeadline?: Date | null;
  iterations?: number;
}

export interface PertComputationResult {
  criticalPath: CriticalPathNode[];
  expectedHours: number;
  stdDevHours: number;
  monteCarlo: MonteCarloResult;
}

export const computePert = ({
  tasks,
  startDate,
  targetDeadline,
  iterations = 1000
}: PertComputationInput): PertComputationResult => {
  if (tasks.length === 0) {
    return {
      criticalPath: [],
      expectedHours: 0,
      stdDevHours: 0,
      monteCarlo: {
        durations: [],
        histogram: [],
        p50Hours: 0,
        p80Hours: 0,
        probabilityByTarget: 0
      }
    };
  }

  const critical = buildCriticalPath(tasks);
  const expectedDuration = critical.duration;
  const stdDev = Math.sqrt(critical.variance);

  const order = orderTasks(tasks);
  const taskMap = new Map(tasks.map((task) => [task.id, task]));
  const durations: number[] = [];

  for (let i = 0; i < iterations; i += 1) {
    const finishTimes = new Map<string, number>();
    order.forEach((taskId) => {
      const task = taskMap.get(taskId);
      if (!task) {
        return;
      }
      const start = task.dependsOn.length
        ? Math.max(...task.dependsOn.map((dependency) => finishTimes.get(dependency) ?? 0))
        : 0;
      const sample = triangularSample(task);
      finishTimes.set(taskId, start + sample);
    });
    const projectDuration = Math.max(...finishTimes.values());
    durations.push(projectDuration);
  }

  const sorted = [...durations].sort((a, b) => a - b);
  const p50 = percentile(sorted, 0.5);
  const p80 = percentile(sorted, 0.8);
  const histogram = buildHistogram(durations);

  let probabilityByTarget = 0;
  if (targetDeadline) {
    const diffHours = (targetDeadline.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const count = durations.filter((duration) => duration <= diffHours).length;
    probabilityByTarget = Number(((count / durations.length) * 100).toFixed(2));
  }

  return {
    criticalPath: critical.path,
    expectedHours: Number(expectedDuration.toFixed(2)),
    stdDevHours: Number(stdDev.toFixed(2)),
    monteCarlo: {
      durations,
      histogram,
      p50Hours: Number(p50.toFixed(2)),
      p80Hours: Number(p80.toFixed(2)),
      probabilityByTarget
    }
  };
};
