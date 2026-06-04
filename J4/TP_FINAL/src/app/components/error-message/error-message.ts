import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="error">
      ❌ {{ message() }}
      <button type="button" (click)="retry.emit()">Reessayer</button>
    </p>
  `,
  styles: `
    .error {
      color: var(--danger);
      background: var(--danger-bg);
      border: 1px solid rgba(255, 107, 138, 0.4);
      border-radius: var(--radius-sm);
      padding: 14px;
      text-align: center;
    }
    button {
      margin-left: 8px;
      padding: 6px 12px;
      border-color: rgba(255, 107, 138, 0.5);
      background: rgba(255, 107, 138, 0.15);
    }
  `,
})
export class ErrorMessageComponent {
  message = input.required<string>();
  retry = output<void>();
}
