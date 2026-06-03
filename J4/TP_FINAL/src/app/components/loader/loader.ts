import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="loader">⏳ Chargement en cours…</p>`,
  styles: `
    .loader {
      text-align: center;
      color: #5ee7a0;
      padding: 24px;
    }
  `,
})
export class LoaderComponent {}
