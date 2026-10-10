import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { createCustomEvent, NAME_MAX_LENGTH } from '@compare/core';
import type { CountdownEvent } from '@compare/core';

@Component({
  selector: 'app-add-event-form',
  imports: [FormsModule],
  templateUrl: './add-event-form.html',
})
export class AddEventForm {
  readonly add = output<CountdownEvent>();

  protected readonly maxLength = NAME_MAX_LENGTH;
  protected readonly name = signal('');
  protected readonly date = signal('');
  protected readonly error = signal('');

  protected handleSubmit() {
    const result = createCustomEvent(this.name(), this.date());
    if (!result.ok) return this.error.set(result.error);
    this.add.emit(result.event);
    this.name.set('');
    this.date.set('');
    this.error.set('');
  }
}
