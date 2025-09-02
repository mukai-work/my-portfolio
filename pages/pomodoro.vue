<template>
  <main class="min-h-screen p-4 bg-gray-100">
    <header class="relative flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold">ポモドーロタイマー</h1>
      <div class="relative">
        <button
          @click="showSettings = !showSettings"
          aria-label="Settings"
          class="text-gray-500"
        >
          ⚙️
        </button>
        <div
          v-if="showSettings"
          class="absolute right-0 mt-2 p-4 bg-white border rounded shadow-md space-y-2"
        >
          <label class="block text-sm">
            作業時間
            <input
              type="number"
              v-model.number="workMinutes"
              :disabled="lockSettings"
              min="1"
              class="border p-1 rounded w-20 ml-2"
            />
          </label>
          <label class="block text-sm">
            休憩時間
            <input
              type="number"
              v-model.number="breakMinutes"
              :disabled="lockSettings"
              min="1"
              class="border p-1 rounded w-20 ml-2"
            />
          </label>
        </div>
      </div>
    </header>

    <section class="text-center space-y-4">
      <div class="text-7xl font-mono">{{ formattedTime }}</div>
      <div class="text-xl">{{ phase === 'work' ? '作業' : '休憩' }}</div>
      <div
        class="w-full h-4 bg-gray-300 rounded"
        role="progressbar"
        :aria-valuenow="phaseDuration - remainingMs"
        :aria-valuemax="phaseDuration"
      >
        <div
          class="h-4 bg-orange-400 rounded"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
      <div class="text-sm">{{ currentSet }} / {{ totalSets }}</div>
    </section>

    <section class="flex justify-center space-x-4 mt-8">
      <button
        @click="handleStartPause"
        aria-label="Start or Pause"
        class="px-4 py-2 bg-orange-500 text-white rounded"
      >
        {{ isRunning ? 'Pause' : 'Start' }}
      </button>
      <button
        @click="reset"
        aria-label="Reset"
        class="px-4 py-2 bg-gray-300 rounded"
      >
        Reset
      </button>
    </section>

    <section class="mt-8 text-center">
      <label class="mr-2" for="set-select">セット数:</label>
      <select
        id="set-select"
        v-model.number="totalSets"
        :disabled="lockSettings"
        class="border p-2 rounded"
      >
        <option v-for="n in 12" :key="n" :value="n">{{ n }}</option>
      </select>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const {
  workMinutes,
  breakMinutes,
  totalSets,
  currentSet,
  phase,
  formattedTime,
  phaseDuration,
  remainingMs,
  progress,
  isRunning,
  isPaused,
  lockSettings,
  start,
  pause,
  resume,
  reset,
} = usePomodoroTimer();

const showSettings = ref(false);

function handleStartPause() {
  if (!isRunning.value && !isPaused.value) start();
  else if (isRunning.value) pause();
  else if (isPaused.value) resume();
}
</script>
