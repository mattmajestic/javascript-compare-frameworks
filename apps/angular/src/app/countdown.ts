import { Component, computed, input } from '@angular/core';
import { formatDate, timeLeft } from '@compare/core';
import type { CountdownEvent } from '@compare/core';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.html',
})
export class Countdown {
  readonly event = input.required<CountdownEvent>();
  readonly now = input.required<Date>();

  protected readonly left = computed(() => timeLeft(this.event().date, this.now()));
  protected readonly formatDate = formatDate;
}
