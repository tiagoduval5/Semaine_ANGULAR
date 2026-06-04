import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <input
      type="search"
      [(ngModel)]="terme"
      (ngModelChange)="onChange($event)"
      placeholder="Rechercher par nom…"
    />
  `,
  styles: `
    input {
      width: 100%;
    }
  `,
})
export class SearchBarComponent {
  terme = '';
  recherche = output<string>();

  onChange(value: string): void {
    this.recherche.emit(value);
  }
}
