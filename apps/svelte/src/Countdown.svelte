<script lang="ts">
  import { formatDate, timeLeft } from '@compare/core';
  import type { CountdownEvent } from '@compare/core';

  let { event, now }: { event: CountdownEvent; now: Date } = $props();

  const left = $derived(timeLeft(event.date, now));
</script>

<section class="hero" aria-labelledby="hero-title">
  <div class="hero-emoji" aria-hidden="true">{event.emoji}</div>
  <h1 id="hero-title" class="hero-title">{event.name}</h1>
  <p class="hero-date">{formatDate(event.date)}</p>
  {#if left.done}
    <p class="hero-done">🎉 It's here!</p>
  {:else}
    <div class="units" role="timer">
      {#each left.units as unit (unit.key)}
        <div class="unit" data-unit={unit.key}>
          <span class="unit-value">{unit.value}</span>
          <span class="unit-label">{unit.label}</span>
        </div>
      {/each}
    </div>
  {/if}
</section>
