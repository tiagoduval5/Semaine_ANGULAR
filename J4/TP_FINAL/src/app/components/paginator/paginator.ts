import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="paginator">
      <button type="button" (click)="prev.emit()" [disabled]="currentPage() <= 1">
        ◀ Precedent
      </button>
      <span>Page {{ currentPage() }} / {{ totalPages() }}</span>
      <button
        type="button"
        (click)="next.emit()"
        [disabled]="currentPage() >= totalPages()"
      >
        Suivant ▶
      </button>
    </nav>
  `,
  styles: `
    .paginator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 16px;
    }
    button {
      border: 1px solid #3d5f4a;
      background: #1a2e24;
      color: #b8f0c8;
      border-radius: 8px;
      padding: 8px 12px;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  `,
})
export class PaginatorComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  prev = output<void>();
  next = output<void>();
}
