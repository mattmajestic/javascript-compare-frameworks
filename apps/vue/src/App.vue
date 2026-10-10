<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { daysLabel, getHolidays, loadCustomEvents, mergeEvents, saveCustomEvents, sourceUrl } from '@compare/core';
import type { CountdownEvent } from '@compare/core';
import AddEventForm from './AddEventForm.vue';
import Countdown from './Countdown.vue';

// #region state
const now = ref(new Date());
const custom = ref(loadCustomEvents());
const selectedId = ref<string | null>(null);
// #endregion

// #region derived
const events = computed(() => mergeEvents(getHolidays(now.value), custom.value));
const selected = computed(() => events.value.find((e) => e.id === selectedId.value) ?? events.value[0]);
// #endregion

// #region effects
let timer: ReturnType<typeof setInterval>;
onMounted(() => (timer = setInterval(() => (now.value = new Date()), 1000)));
onUnmounted(() => clearInterval(timer));

watch(custom, (list) => saveCustomEvents(list), { deep: true });
// #endregion

function addEvent(event: CountdownEvent) {
  custom.value.push(event);
  selectedId.value = event.id;
}

function removeEvent(id: string) {
  custom.value = custom.value.filter((e) => e.id !== id);
}
</script>

<template>
  <div class="app" :data-theme="selected.theme" data-framework="vue">
    <header class="topbar">
      <span class="badge"><span class="badge-dot"></span>Vue</span>
      <a class="source-link" :href="sourceUrl('vue')" target="_blank" rel="noreferrer">View source ↗</a>
    </header>

    <main class="layout">
      <Countdown :event="selected" :now="now" />

      <aside class="sidebar">
        <section class="panel">
          <h2 class="panel-title">Upcoming</h2>
          <!-- #region list -->
          <ul class="event-list">
            <li v-for="event in events" :key="event.id" class="event-item">
              <button
                type="button"
                class="event"
                :aria-pressed="event.id === selected.id"
                @click="selectedId = event.id"
              >
                <span class="event-emoji" aria-hidden="true">{{ event.emoji }}</span>
                <span class="event-name">{{ event.name }}</span>
                <span class="event-days">{{ daysLabel(event.date, now) }}</span>
              </button>
              <button
                v-if="event.custom"
                type="button"
                class="event-remove"
                :aria-label="`Remove ${event.name}`"
                @click="removeEvent(event.id)"
              >
                ×
              </button>
            </li>
          </ul>
          <!-- #endregion -->
        </section>

        <AddEventForm @add="addEvent" />
      </aside>
    </main>
  </div>
</template>
