<script setup lang="ts">
import { computed } from 'vue';
import { formatDate, timeLeft } from '@compare/core';
import type { CountdownEvent } from '@compare/core';

const props = defineProps<{ event: CountdownEvent; now: Date }>();

const left = computed(() => timeLeft(props.event.date, props.now));
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-emoji" aria-hidden="true">{{ event.emoji }}</div>
    <h1 id="hero-title" class="hero-title">{{ event.name }}</h1>
    <p class="hero-date">{{ formatDate(event.date) }}</p>
    <p v-if="left.done" class="hero-done">🎉 It's here!</p>
    <div v-else class="units" role="timer">
      <div v-for="unit in left.units" :key="unit.key" class="unit" :data-unit="unit.key">
        <span class="unit-value">{{ unit.value }}</span>
        <span class="unit-label">{{ unit.label }}</span>
      </div>
    </div>
  </section>
</template>
