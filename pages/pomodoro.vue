<template>
  <main class="min-h-screen p-4 bg-gray-100">
    <header class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold">ポモドーロタイマー</h1>
      <span class="text-gray-500" aria-hidden="true">⚙️</span>
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
        v-if="!isRunning && !isPaused"
        @click="start"
        aria-label="Start"
        class="px-4 py-2 bg-orange-500 text-white rounded"
      >
        Start
      </button>
      <button
        v-if="isRunning"
        @click="pause"
        aria-label="Pause"
        class="px-4 py-2 bg-orange-500 text-white rounded"
      >
        Pause
      </button>
      <button
        v-if="isPaused"
        @click="resume"
        aria-label="Resume"
        class="px-4 py-2 bg-orange-500 text-white rounded"
      >
        Resume
      </button>
      <button
        @click="stop"
        aria-label="Stop"
        class="px-4 py-2 bg-gray-300 rounded"
      >
        Stop
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
const {
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
  stop,
  reset,
} = usePomodoroTimer();
</script>
