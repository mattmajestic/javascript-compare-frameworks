import { Index, Show } from 'solid-js';
import { formatDate, timeLeft } from '@compare/core';
import type { CountdownEvent } from '@compare/core';

type Props = { event: CountdownEvent; now: Date };

// Props are reactive getters in Solid, so read them as `props.x` (no destructuring).
export function Countdown(props: Props) {
  const left = () => timeLeft(props.event.date, props.now);

  return (
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-emoji" aria-hidden="true">{props.event.emoji}</div>
      <h1 class="hero-title" id="hero-title">{props.event.name}</h1>
      <p class="hero-date">{formatDate(props.event.date)}</p>
      <Show when={!left().done} fallback={<p class="hero-done">🎉 It's here!</p>}>
        <div class="units" role="timer">
          <Index each={left().units}>
            {(unit) => (
              <div class="unit" data-unit={unit().key}>
                <span class="unit-value">{unit().value}</span>
                <span class="unit-label">{unit().label}</span>
              </div>
            )}
          </Index>
        </div>
      </Show>
    </section>
  );
}
