import { mount } from 'svelte';
import '@compare/core/styles.css';
import App from './App.svelte';

export default mount(App, { target: document.getElementById('app')! });
