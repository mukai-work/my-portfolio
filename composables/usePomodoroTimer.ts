import { ref, computed, onMounted, onUnmounted } from 'vue';

export const usePomodoroTimer = () => {
  const workMinutes = ref(25);
  const breakMinutes = ref(5);
  const totalSets = ref(4);
  const currentSet = ref(1);
  const phase = ref<'work' | 'break'>('work');
  const remainingMs = ref(workMinutes.value * 60 * 1000);
  const isRunning = ref(false);
  const isPaused = ref(false);
  const lockSettings = ref(false);
  let targetAt: number | null = null;
  let rafId: number | null = null;

  const phaseDuration = computed(() =>
    (phase.value === 'work' ? workMinutes.value : breakMinutes.value) * 60 * 1000
  );

  const formattedTime = computed(() => {
    const totalSec = Math.ceil(remainingMs.value / 1000);
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${m}:${s}`;
  });

  const progress = computed(() =>
    ((phaseDuration.value - remainingMs.value) / phaseDuration.value) * 100
  );

  function tick() {
    if (!isRunning.value || targetAt === null) return;
    remainingMs.value = Math.max(0, targetAt - Date.now());
    if (remainingMs.value <= 0) {
      nextPhase();
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (isRunning.value || isPaused.value) return;
    lockSettings.value = true;
    targetAt = Date.now() + remainingMs.value;
    isRunning.value = true;
    tick();
  }

  function pause() {
    if (!isRunning.value) return;
    isRunning.value = false;
    isPaused.value = true;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function resume() {
    if (!isPaused.value) return;
    targetAt = Date.now() + remainingMs.value;
    isRunning.value = true;
    isPaused.value = false;
    tick();
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    isRunning.value = false;
    isPaused.value = false;
    targetAt = null;
    remainingMs.value = phaseDuration.value;
  }

  function reset() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    isRunning.value = false;
    isPaused.value = false;
    targetAt = null;
    phase.value = 'work';
    currentSet.value = 1;
    lockSettings.value = false;
    remainingMs.value = workMinutes.value * 60 * 1000;
  }

  function nextPhase() {
    if (phase.value === 'work') {
      phase.value = 'break';
      remainingMs.value = breakMinutes.value * 60 * 1000;
    } else {
      currentSet.value += 1;
      if (currentSet.value > totalSets.value) {
        reset();
        return;
      }
      phase.value = 'work';
      remainingMs.value = workMinutes.value * 60 * 1000;
    }
    targetAt = Date.now() + remainingMs.value;
    tick();
  }

  function handleKey(e: KeyboardEvent) {
    if (e.code === 'Space') {
      e.preventDefault();
      if (!isRunning.value && !isPaused.value) start();
      else if (isRunning.value) pause();
      else if (isPaused.value) resume();
    } else if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      stop();
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      reset();
    } else if (!isRunning.value && !isPaused.value) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (totalSets.value < 12) totalSets.value++;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (totalSets.value > 1) totalSets.value--;
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKey);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKey);
    if (rafId) cancelAnimationFrame(rafId);
  });

  return {
    workMinutes,
    breakMinutes,
    totalSets,
    currentSet,
    phase,
    remainingMs,
    phaseDuration,
    formattedTime,
    progress,
    isRunning,
    isPaused,
    lockSettings,
    start,
    pause,
    resume,
    stop,
    reset,
  };
};
