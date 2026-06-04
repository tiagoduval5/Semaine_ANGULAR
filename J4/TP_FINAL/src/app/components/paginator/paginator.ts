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
    span {
      font-family: var(--font-display);
      font-size: 0.85rem;
      letter-spacing: 0.04em;
      color: var(--text-soft);
    }
    button {
      padding: 8px 14px;
    }
  `,
})
export class PaginatorComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  prev = output<void>();
  next = output<void>();
}
