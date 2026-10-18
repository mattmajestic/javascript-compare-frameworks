<script setup lang="ts">
import { ref } from 'vue';
import { createCustomEvent, NAME_MAX_LENGTH } from '@compare/core';
import type { CountdownEvent } from '@compare/core';

const emit = defineEmits<{ add: [event: CountdownEvent] }>();

const name = ref('');
const date = ref('');
const error = ref('');

function handleSubmit() {
  const result = createCustomEvent(name.value, date.value);
  if (!result.ok) return (error.value = result.error);
  emit('add', result.event);
  name.value = '';
  date.value = '';
  error.value = '';
}
</script>

<template>
  <form class="panel add-form" novalidate @submit.prevent="handleSubmit">
    <h2 class="panel-title">Add a countdown</h2>
    <label class="field">
      <span>Name</span>
      <input v-model="name" name="name" placeholder="Product launch" :maxlength="NAME_MAX_LENGTH" />
    </label>
    <label class="field">
      <span>Date</span>
      <input v-model="date" type="date" name="date" />
    </label>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <button type="submit" class="button">Add countdown</button>
    <p class="form-note"><span class="airtable-mark" aria-hidden="true"></span>Synced to Airtable</p>
  </form>
</template>
