import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { daysLabel, getHolidays, loadCustomEvents, mergeEvents, saveCustomEvents, sourceUrl } from '@compare/core';
import type { CountdownEvent } from '@compare/core';
import { AddEventForm } from './add-event-form';
import { Benchmark } from './benchmark';
import { Countdown } from './countdown';

@Component({
  selector: 'app-root',
  imports: [Countdown, AddEventForm, Benchmark],
  templateUrl: './app.html',
})
export class App {
  // #region state
  protected readonly now = signal(new Date());
  protected readonly custom = signal(loadCustomEvents());
  protected readonly selectedId = signal<string | null>(null);
  // #endregion

  // #region derived
  protected readonly events = computed(() => mergeEvents(getHolidays(this.now()), this.custom()));
  protected readonly selected = computed(
    () => this.events().find((e) => e.id === this.selectedId()) ?? this.events()[0],
  );
  // #endregion

  protected readonly daysLabel = daysLabel;
  protected readonly sourceUrl = sourceUrl('angular');

  constructor() {
    // #region effects
    const timer = setInterval(() => this.now.set(new Date()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));

    effect(() => saveCustomEvents(this.custom()));
    // #endregion
  }

  protected addEvent(event: CountdownEvent) {
    this.custom.update((list) => [...list, event]);
    this.selectedId.set(event.id);
  }

  protected removeEvent(id: string) {
    this.custom.update((list) => list.filter((e) => e.id !== id));
  }
}
