<template>
  <canvas ref="canvas" class="h-48 w-full rounded-lg border border-slate-200 bg-white"></canvas>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import type { MonteCarloHistogramBin } from '~/types/brief2plan';

const props = defineProps<{ bins: MonteCarloHistogramBin[] }>();

const canvas = ref<HTMLCanvasElement | null>(null);

const draw = () => {
  const element = canvas.value;
  if (!element) return;
  const context = element.getContext('2d');
  if (!context) return;

  const width = (element.width = element.offsetWidth || 600);
  const height = (element.height = element.offsetHeight || 200);
  context.clearRect(0, 0, width, height);

  if (!props.bins.length) {
    context.fillStyle = '#94a3b8';
    context.fillText('データなし', 16, height / 2);
    return;
  }

  const max = Math.max(...props.bins.map((bin) => bin.value));
  const barWidth = width / props.bins.length;

  props.bins.forEach((bin, index) => {
    const barHeight = (bin.value / max) * (height - 40);
    context.fillStyle = '#2563eb';
    context.fillRect(index * barWidth + 8, height - barHeight - 20, barWidth - 16, barHeight);
    context.fillStyle = '#475569';
    context.font = '10px sans-serif';
    context.fillText(`${bin.value.toFixed(1)}%`, index * barWidth + 8, height - barHeight - 24);
  });

  context.fillStyle = '#475569';
  context.font = '9px sans-serif';
  props.bins.forEach((bin, index) => {
    context.save();
    context.translate(index * barWidth + barWidth / 2, height - 4);
    context.rotate((-45 * Math.PI) / 180);
    context.fillText(bin.label, 0, 0);
    context.restore();
  });
};

onMounted(draw);
watch(
  () => props.bins,
  () => {
    draw();
  },
  { deep: true }
);
</script>
