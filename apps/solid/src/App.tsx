import { createEffect, createMemo, createSignal, Index, onCleanup, Show } from 'solid-js';
import { daysLabel, getHolidays, loadCustomEvents, mergeEvents, saveCustomEvents, sourceUrl } from '@compare/core';
import type { CountdownEvent } from '@compare/core';
import { AddEventForm } from './AddEventForm';
import { Countdown } from './Countdown';

export function App() {
  // #region state
  const [now, setNow] = createSignal(new Date());
  const [custom, setCustom] = createSignal(loadCustomEvents());
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  // #endregion

  // #region derived
  const events = createMemo(() => mergeEvents(getHolidays(now()), custom()));
  const selected = () => events().find((e) => e.id === selectedId()) ?? events()[0];
  // #endregion

  // #region effects
  const timer = setInterval(() => setNow(new Date()), 1000);
  onCleanup(() => clearInterval(timer));

  createEffect(() => saveCustomEvents(custom()));
  // #endregion

  function addEvent(event: CountdownEvent) {
    setCustom((list) => [...list, event]);
    setSelectedId(event.id);
  }

  function removeEvent(id: string) {
    setCustom((list) => list.filter((e) => e.id !== id));
  }

  return (
    <div class="app" data-theme={selected().theme} data-framework="solid">
      <header class="topbar">
        <span class="badge">
          <span class="badge-dot" />
          Solid
        </span>
        <a class="source-link" href={sourceUrl('solid')} target="_blank" rel="noreferrer">
          View source ↗
        </a>
      </header>

      <main class="layout">
        <Countdown event={selected()} now={now()} />

        <aside class="sidebar">
          <section class="panel">
            <h2 class="panel-title">Upcoming</h2>
            {/* #region list */}
            <ul class="event-list">
              <Index each={events()}>
                {(event) => (
                  <li class="event-item">
                    <button
                      type="button"
                      class="event"
                      aria-pressed={event().id === selected().id}
                      onClick={() => setSelectedId(event().id)}
                    >
                      <span class="event-emoji" aria-hidden="true">{event().emoji}</span>
                      <span class="event-name">{event().name}</span>
                      <span class="event-days">{daysLabel(event().date, now())}</span>
                    </button>
                    <Show when={event().custom}>
                      <button
                        type="button"
                        class="event-remove"
                        aria-label={`Remove ${event().name}`}
                        onClick={() => removeEvent(event().id)}
                      >
                        ×
                      </button>
                    </Show>
                  </li>
                )}
              </Index>
            </ul>
            {/* #endregion */}
          </section>

          <AddEventForm onAdd={addEvent} />
        </aside>
      </main>
    </div>
  );
}
