<script lang="ts">
  import { daysLabel, getHolidays, loadCustomEvents, mergeEvents, saveCustomEvents, sourceUrl } from '@compare/core';
  import type { CountdownEvent } from '@compare/core';
  import AddEventForm from './AddEventForm.svelte';
  import Benchmark from './Benchmark.svelte';
  import Countdown from './Countdown.svelte';

  // #region state
  let now = $state(new Date());
  let custom = $state(loadCustomEvents());
  let selectedId = $state<string | null>(null);
  // #endregion

  // #region derived
  const events = $derived(mergeEvents(getHolidays(now), custom));
  const selected = $derived(events.find((e) => e.id === selectedId) ?? events[0]);
  // #endregion

  // #region effects
  $effect(() => {
    const timer = setInterval(() => (now = new Date()), 1000);
    return () => clearInterval(timer);
  });

  $effect(() => saveCustomEvents(custom));
  // #endregion

  function addEvent(event: CountdownEvent) {
    custom.push(event);
    selectedId = event.id;
  }

  function removeEvent(id: string) {
    custom = custom.filter((e) => e.id !== id);
  }
</script>

<div class="app" data-theme={selected.theme} data-framework="svelte">
  <header class="topbar">
    <span class="badge"><span class="badge-dot"></span>Svelte</span>
    <a class="source-link" href={sourceUrl('svelte')} target="_blank" rel="noreferrer">View source ↗</a>
  </header>

  <main class="layout">
    <Countdown event={selected} {now} />

    <aside class="sidebar">
      <section class="panel">
        <h2 class="panel-title">Upcoming</h2>
        <!-- #region list -->
        <ul class="event-list">
          {#each events as event (event.id)}
            <li class="event-item">
              <button
                type="button"
                class="event"
                aria-pressed={event.id === selected.id}
                onclick={() => (selectedId = event.id)}
              >
                <span class="event-emoji" aria-hidden="true">{event.emoji}</span>
                <span class="event-name">{event.name}</span>
                <span class="event-days">{daysLabel(event.date, now)}</span>
              </button>
              {#if event.custom}
                <button
                  type="button"
                  class="event-remove"
                  aria-label="Remove {event.name}"
                  onclick={() => removeEvent(event.id)}
                >
                  ×
                </button>
              {/if}
            </li>
          {/each}
        </ul>
        <!-- #endregion -->
      </section>

      <AddEventForm onadd={addEvent} />
    </aside>
  </main>

  <Benchmark />
</div>
