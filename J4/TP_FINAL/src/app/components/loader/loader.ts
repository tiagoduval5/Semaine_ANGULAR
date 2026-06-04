import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="loader">🌀 Chargement du portail…</p>`,
  styles: `
    .loader {
      text-align: center;
      font-family: var(--font-display);
      font-size: 0.9rem;
      letter-spacing: 0.05em;
      color: var(--accent-cyan);
      padding: 28px;
      animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes pulse {
      50% { opacity: 0.55; }
    }
  `,
})
export class LoaderComponent {}
