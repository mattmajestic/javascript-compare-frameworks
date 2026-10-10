import { formatDate, timeLeft } from '@compare/core';
import type { CountdownEvent } from '@compare/core';

type Props = { event: CountdownEvent; now: Date };

export function Countdown({ event, now }: Props) {
  const { done, units } = timeLeft(event.date, now);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-emoji" aria-hidden="true">{event.emoji}</div>
      <h1 className="hero-title" id="hero-title">{event.name}</h1>
      <p className="hero-date">{formatDate(event.date)}</p>
      {done ? (
        <p className="hero-done">🎉 It's here!</p>
      ) : (
        <div className="units" role="timer">
          {units.map((unit) => (
            <div key={unit.key} className="unit" data-unit={unit.key}>
              <span className="unit-value">{unit.value}</span>
              <span className="unit-label">{unit.label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
