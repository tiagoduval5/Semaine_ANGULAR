import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'status' })
export class StatusPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'Alive':
        return '💚 Vivant';
      case 'Dead':
        return '💀 Mort';
      default:
        return '👽 Inconnu';
    }
  }
}
