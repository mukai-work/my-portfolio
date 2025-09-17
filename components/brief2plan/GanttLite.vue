<template>
  <div class="overflow-x-auto">
    <svg :viewBox="viewBox" class="h-64 min-w-full bg-white">
      <g v-for="(bar, index) in bars" :key="bar.id" :transform="`translate(0, ${index * rowHeight})`">
        <text x="0" :y="rowHeight / 2" class="fill-slate-600 text-xs">{{ bar.name }}</text>
        <rect
          :x="bar.start * scale"
          y="rowPadding"
          :width="Math.max(bar.duration * scale, 2)"
          :height="barHeight"
          :class="bar.isCritical ? 'fill-primary-500' : 'fill-slate-300'"
          class="transition-colors"
        />
        <text
          :x="bar.start * scale + bar.duration * scale + 4"
          :y="rowHeight / 2"
          class="fill-slate-400 text-[10px]"
        >
          {{ bar.finish.toFixed(1) }}h
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { CriticalPathNode, GeneratedTaskInput } from '~/types/brief2plan';

const props = defineProps<{
  tasks: GeneratedTaskInput[];
  criticalPath: CriticalPathNode[];
}>();

const width = 900;
const rowHeight = 36;
const rowPadding = 6;
const barHeight = rowHeight - rowPadding * 2;

const expectedHours = (task: GeneratedTaskInput) =>
  (task.optimisticH + 4 * task.mostLikelyH + task.pessimisticH) / 6;

const schedule = computed(() => {
  const tasksById = new Map(props.tasks.map((task) => [task.id, task]));
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  props.tasks.forEach((task) => {
    inDegree.set(task.id, task.dependsOn.length);
    task.dependsOn.forEach((dependency) => {
      dependents.set(dependency, [...(dependents.get(dependency) || []), task.id]);
    });
  });
  const queue = props.tasks.filter((task) => (inDegree.get(task.id) ?? 0) === 0).map((task) => task.id);
  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift();
    if (!id) break;
    order.push(id);
    (dependents.get(id) || []).forEach((dependent) => {
      const next = (inDegree.get(dependent) ?? 0) - 1;
      inDegree.set(dependent, next);
      if (next === 0) {
        queue.push(dependent);
      }
    });
  }
  const starts = new Map<string, number>();
  const finishes = new Map<string, number>();
  order.forEach((id) => {
    const task = tasksById.get(id);
    if (!task) return;
    const deps = task.dependsOn.map((dependency) => finishes.get(dependency) ?? 0);
    const start = deps.length ? Math.max(...deps) : 0;
    const duration = expectedHours(task);
    starts.set(id, start);
    finishes.set(id, start + duration);
  });
  const maxFinish = Math.max(...Array.from(finishes.values()), 1);
  return { starts, finishes, maxFinish };
});

const scale = computed(() => width / (schedule.value.maxFinish * 1.1));
const height = computed(() => Math.max(props.tasks.length, 1) * rowHeight);
const viewBox = computed(() => `0 0 ${width} ${height.value}`);

const criticalIds = computed(() => new Set(props.criticalPath.map((node) => node.id)));

const bars = computed(() =>
  props.tasks.map((task) => {
    const start = schedule.value.starts.get(task.id) ?? 0;
    const finish = schedule.value.finishes.get(task.id) ?? expectedHours(task);
    return {
      id: task.id,
      name: task.name,
      start,
      finish,
      duration: finish - start,
      isCritical: criticalIds.value.has(task.id)
    };
  })
);
</script>
