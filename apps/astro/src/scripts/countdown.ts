// The interactive island, written without a framework. Everything a framework
// would do for you (re-rendering, keyed list updates, keeping focus) is manual.
import {
  createCustomEvent,
  daysLabel,
  formatDate,
  getHolidays,
  loadCustomEvents,
  mergeEvents,
  saveCustomEvents,
  timeLeft,
} from '@compare/core';
import type { CountdownEvent } from '@compare/core';

const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) =>
  root.querySelector<T>(selector)!;

// #region state
let now = new Date();
let custom = loadCustomEvents();
let selectedId: string | null = null;
// #endregion

function render() {
  // #region derived
  const events = mergeEvents(getHolidays(now), custom);
  const selected = events.find((e) => e.id === selectedId) ?? events[0];
  // #endregion
  renderHero(selected);
  renderList(events, selected);
}

function setCustom(next: CountdownEvent[]) {
  custom = next;
  saveCustomEvents(custom);
  render();
}

// #region props
function renderHero(event: CountdownEvent) {
  const { done, units } = timeLeft(event.date, now);
  $('.app').dataset.theme = event.theme;
  $('.hero-emoji').textContent = event.emoji;
  $('.hero-title').textContent = event.name;
  $('.hero-date').textContent = formatDate(event.date);
  $('.hero-done').hidden = !done;
  $('.units').hidden = done;
  for (const unit of units) $(`[data-unit="${unit.key}"] .unit-value`).textContent = unit.value;
}
// #endregion

// #region list
const list = $('.event-list');
const itemTemplate = $<HTMLTemplateElement>('#event-item');
let renderedIds = '';

function renderList(events: CountdownEvent[], selected: CountdownEvent) {
  // Only rebuild the DOM when the set of events changes, so focus isn't lost every tick.
  const ids = events.map((e) => e.id).join();
  if (ids !== renderedIds) {
    renderedIds = ids;
    list.replaceChildren(...events.map(createItem));
  }
  events.forEach((event, i) => {
    const item = list.children[i];
    $('.event', item).setAttribute('aria-pressed', String(event.id === selected.id));
    $('.event-days', item).textContent = daysLabel(event.date, now);
  });
}

function createItem(event: CountdownEvent) {
  const item = itemTemplate.content.firstElementChild!.cloneNode(true) as HTMLLIElement;
  item.dataset.id = event.id;
  $('.event-emoji', item).textContent = event.emoji;
  $('.event-name', item).textContent = event.name;
  const remove = $('.event-remove', item);
  if (event.custom) remove.setAttribute('aria-label', `Remove ${event.name}`);
  else remove.remove();
  return item;
}

list.addEventListener('click', (e) => {
  const button = (e.target as Element).closest('button');
  const id = button?.closest('li')?.dataset.id;
  if (!button || !id) return;
  if (button.classList.contains('event-remove')) return setCustom(custom.filter((ev) => ev.id !== id));
  selectedId = id;
  render();
});
// #endregion

// #region form
const form = $<HTMLFormElement>('.add-form');
const error = $('.form-error');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const result = createCustomEvent(String(data.get('name')), String(data.get('date')));
  error.hidden = result.ok;
  if (!result.ok) return void (error.textContent = result.error);
  selectedId = result.event.id;
  form.reset();
  setCustom([...custom, result.event]);
});
// #endregion

// #region effects
setInterval(() => {
  now = new Date();
  render();
}, 1000);
// #endregion

render();
