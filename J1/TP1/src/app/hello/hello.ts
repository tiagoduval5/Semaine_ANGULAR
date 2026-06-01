import { Component } from '@angular/core';

@Component({
  selector: 'app-hello',
  standalone: true,
  imports: [],
  templateUrl: './hello.html',
  styleUrl: './hello.scss'
})
export class HelloComponent {
  prenom = 'Tiago';
  age = 20;
}
