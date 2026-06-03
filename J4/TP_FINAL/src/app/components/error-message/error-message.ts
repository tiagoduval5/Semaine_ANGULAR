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
      color: #ff8a8a;
      background: #2a1212;
      border: 1px solid #5c2020;
      border-radius: 10px;
      padding: 14px;
      text-align: center;
    }
    button {
      margin-left: 8px;
      border-radius: 8px;
      border: 1px solid #7a3030;
      background: #3a1515;
      color: #fff;
      cursor: pointer;
      padding: 6px 10px;
    }
  `,
})
export class ErrorMessageComponent {
  message = input.required<string>();
  retry = output<void>();
}
