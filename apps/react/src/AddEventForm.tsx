import { useState } from 'react';
import type { FormEvent } from 'react';
import { createCustomEvent, NAME_MAX_LENGTH } from '@compare/core';
import type { CountdownEvent } from '@compare/core';

type Props = { onAdd: (event: CountdownEvent) => void };

export function AddEventForm({ onAdd }: Props) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = createCustomEvent(name, date);
    if (!result.ok) return setError(result.error);
    onAdd(result.event);
    setName('');
    setDate('');
    setError('');
  }

  return (
    <form className="panel add-form" onSubmit={handleSubmit} noValidate>
      <h2 className="panel-title">Add a countdown</h2>
      <label className="field">
        <span>Name</span>
        <input
          name="name"
          placeholder="Product launch"
          maxLength={NAME_MAX_LENGTH}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="field">
        <span>Date</span>
        <input type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="button">Add countdown</button>
      <p className="form-note"><span className="airtable-mark" aria-hidden="true"></span>Synced to Airtable</p>
    </form>
  );
}
