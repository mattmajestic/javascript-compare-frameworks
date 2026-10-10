<script lang="ts">
  import { createCustomEvent, NAME_MAX_LENGTH } from '@compare/core';
  import type { CountdownEvent } from '@compare/core';

  let { onadd }: { onadd: (event: CountdownEvent) => void } = $props();

  let name = $state('');
  let date = $state('');
  let error = $state('');

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const result = createCustomEvent(name, date);
    if (!result.ok) return (error = result.error);
    onadd(result.event);
    name = '';
    date = '';
    error = '';
  }
</script>

<form class="panel add-form" novalidate onsubmit={handleSubmit}>
  <h2 class="panel-title">Add a countdown</h2>
  <label class="field">
    <span>Name</span>
    <input bind:value={name} name="name" placeholder="Product launch" maxlength={NAME_MAX_LENGTH} />
  </label>
  <label class="field">
    <span>Date</span>
    <input bind:value={date} type="date" name="date" />
  </label>
  {#if error}
    <p class="form-error" role="alert">{error}</p>
  {/if}
  <button type="submit" class="button">Add countdown</button>
</form>
