import { createSignal, Show } from 'solid-js';
import { createCustomEvent, NAME_MAX_LENGTH } from '@compare/core';
import type { CountdownEvent } from '@compare/core';

type Props = { onAdd: (event: CountdownEvent) => void };

export function AddEventForm(props: Props) {
  const [name, setName] = createSignal('');
  const [date, setDate] = createSignal('');
  const [error, setError] = createSignal('');

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const result = createCustomEvent(name(), date());
    if (!result.ok) return setError(result.error);
    props.onAdd(result.event);
    setName('');
    setDate('');
    setError('');
  }

  return (
    <form class="panel add-form" onSubmit={handleSubmit} novalidate>
      <h2 class="panel-title">Add a countdown</h2>
      <label class="field">
        <span>Name</span>
        <input
          name="name"
          placeholder="Product launch"
          maxLength={NAME_MAX_LENGTH}
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
        />
      </label>
      <label class="field">
        <span>Date</span>
        <input type="date" name="date" value={date()} onInput={(e) => setDate(e.currentTarget.value)} />
      </label>
      <Show when={error()}>
        <p class="form-error" role="alert">{error()}</p>
      </Show>
      <button type="submit" class="button">Add countdown</button>
    </form>
  );
}
