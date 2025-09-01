<template>
  <div :class="['weather-container', weatherClass, isDay ? 'day' : 'night']">
    <div class="info bg-white bg-opacity-70 p-4 rounded shadow text-center">
      <h1 class="text-3xl font-bold">{{ locationName }}</h1>
      <p class="mt-2 text-lg">{{ temperature }}°C - {{ weatherDescription }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface CurrentWeather {
  temperature: number;
  weathercode: number;
  is_day: number;
}

const temperature = ref<number | null>(null);
const weatherCode = ref<number>(0);
const isDay = ref(true);
const locationName = ref('Loading...');

const weatherDescription = computed(() => {
  const code = weatherCode.value;
  if (code === 0) return 'Clear sky';
  if (code === 1 || code === 2) return 'Partly cloudy';
  if (code === 3 || code === 45 || code === 48) return 'Cloudy';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 95) return 'Thunderstorm';
  return 'Unknown';
});

const weatherClass = computed(() => {
  const code = weatherCode.value;
  if (code === 0 || code === 1 || code === 2) return 'clear';
  if (code === 3 || code === 45 || code === 48) return 'cloudy';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 95) return 'thunder';
  return 'cloudy';
});

async function loadWeather(lat: number, lon: number, fallbackName?: string) {
  const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`);
  const weatherData = await weatherRes.json();
  const current: CurrentWeather = weatherData.current_weather;
  temperature.value = current.temperature;
  weatherCode.value = current.weathercode;
  isDay.value = current.is_day === 1;

  if (fallbackName) {
    locationName.value = fallbackName;
  } else {
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en`);
      const geoData = await geoRes.json();
      locationName.value = geoData.results?.[0]?.name || 'Your location';
    } catch {
      locationName.value = 'Your location';
    }
  }
}

onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => loadWeather(pos.coords.latitude, pos.coords.longitude),
      () => loadWeather(35.6895, 139.6917, 'Tokyo')
    );
  } else {
    loadWeather(35.6895, 139.6917, 'Tokyo');
  }
});
</script>

<style scoped>
.weather-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 1s;
}

.weather-container.day {
  color: #333;
}

.weather-container.night {
  color: #fff;
}

/* Clear sky */
.clear.day {
  background: linear-gradient(to top, #a8e0ff, #ffffff);
}

.clear.night {
  background: linear-gradient(to top, #0d1b2a, #1b263b);
}

/* Cloudy */
.cloudy.day {
  background: linear-gradient(to top, #d7d2cc, #304352);
}

.cloudy.night {
  background: linear-gradient(to top, #485563, #29323c);
}

/* Rain */
.rain.day,
.rain.night {
  background: linear-gradient(#4e54c8, #8f94fb);
}

.rain::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0) 100%);
  background-size: 2px 50px;
  animation: rain 0.5s linear infinite;
}

@keyframes rain {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 0 50px;
  }
}

/* Snow */
.snow.day,
.snow.night {
  background: linear-gradient(#83a4d4, #b6fbff);
}

.snow::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-image: radial-gradient(#fff 1px, transparent 1px);
  background-size: 10px 10px;
  animation: snow 10s linear infinite;
  opacity: 0.7;
}

@keyframes snow {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 0 100%;
  }
}

/* Thunderstorm */
.thunder.day,
.thunder.night {
  background: linear-gradient(#141e30, #243b55);
}

.thunder::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-color: rgba(255, 255, 255, 0);
  animation: thunder 5s infinite;
}

@keyframes thunder {
  0%, 95%, 100% {
    background-color: rgba(255, 255, 255, 0);
  }
  96%, 98% {
    background-color: rgba(255, 255, 255, 0.6);
  }
}

.info {
  z-index: 1;
}
</style>

