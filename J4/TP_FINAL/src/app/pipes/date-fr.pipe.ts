import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateFr' })
export class DateFrPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value?.trim()) return '—';
    const normalise = value.trim().toLowerCase();
    if (normalise === 'unknown') return 'Date inconnue';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
