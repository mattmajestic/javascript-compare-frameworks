import { useEffect, useState } from 'react';
import { daysLabel, getHolidays, loadCustomEvents, mergeEvents, saveCustomEvents, sourceUrl } from '@compare/core';
import type { CountdownEvent } from '@compare/core';
import { AddEventForm } from './AddEventForm';
import { Benchmark } from './Benchmark';
import { Countdown } from './Countdown';

export function App() {
  // #region state
  const [now, setNow] = useState(() => new Date());
  const [custom, setCustom] = useState(() => loadCustomEvents());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // #endregion

  // #region derived
  const events = mergeEvents(getHolidays(now), custom);
  const selected = events.find((e) => e.id === selectedId) ?? events[0];
  // #endregion

  // #region effects
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => saveCustomEvents(custom), [custom]);
  // #endregion

  function addEvent(event: CountdownEvent) {
    setCustom((list) => [...list, event]);
    setSelectedId(event.id);
  }

  function removeEvent(id: string) {
    setCustom((list) => list.filter((e) => e.id !== id));
  }

  return (
    <div className="app" data-theme={selected.theme} data-framework="react">
      <header className="topbar">
        <span className="badge">
          <span className="badge-dot" />
          React
        </span>
        <a className="source-link" href={sourceUrl('react')} target="_blank" rel="noreferrer">
          View source ↗
        </a>
      </header>

      <main className="layout">
        <Countdown event={selected} now={now} />

        <aside className="sidebar">
          <section className="panel">
            <h2 className="panel-title">Upcoming</h2>
            {/* #region list */}
            <ul className="event-list">
              {events.map((event) => (
                <li key={event.id} className="event-item">
                  <button
                    type="button"
                    className="event"
                    aria-pressed={event.id === selected.id}
                    onClick={() => setSelectedId(event.id)}
                  >
                    <span className="event-emoji" aria-hidden="true">{event.emoji}</span>
                    <span className="event-name">{event.name}</span>
                    <span className="event-days">{daysLabel(event.date, now)}</span>
                  </button>
                  {event.custom && (
                    <button
                      type="button"
                      className="event-remove"
                      aria-label={`Remove ${event.name}`}
                      onClick={() => removeEvent(event.id)}
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {/* #endregion */}
          </section>

          <AddEventForm onAdd={addEvent} />
        </aside>
      </main>

      <Benchmark />
    </div>
  );
}
