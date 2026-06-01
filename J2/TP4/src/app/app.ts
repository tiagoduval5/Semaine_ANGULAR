import { Component } from '@angular/core';
import { ContactManagerComponent } from './components/contact-manager/contact-manager';

@Component({
  selector: 'app-root',
  imports: [ContactManagerComponent],
  template: `<app-contact-manager />`,
})
export class App {}
