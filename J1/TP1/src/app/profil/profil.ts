import { Component } from '@angular/core';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [],
  templateUrl: './profil.html',
  styleUrl: './profil.scss'
})
export class ProfilComponent {
  nom = 'Tiago';
  metier = 'Student';
  photo = 'https://i.pravatar.cc/150?img=12';

  contacter() {
    alert(`Contacter ${this.nom}`);
  }
}