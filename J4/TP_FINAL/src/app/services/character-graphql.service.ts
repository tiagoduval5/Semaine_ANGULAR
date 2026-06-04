import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, catchError, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Character } from '../models/character.model';
import { CharacterService } from './character.service';

const LISTE_PERSONNAGES = gql`
  query Personnages($page: Int, $name: String, $status: String) {
    characters(page: $page, filter: { name: $name, status: $status }) {
      info {
        count
        pages
        next
        prev
      }
      results {
        id
        name
        status
        species
        image
        location {
          id
          name
        }
        episode {
          id
          name
        }
      }
    }
  }
`;

type PersonnageGraphql = {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
  location: { id: number; name: string } | null;
  episode: { id: number; name: string }[];
};

type ReponseListe = {
  characters: {
    info: ApiResponse<Character>['info'];
    results: PersonnageGraphql[];
  };
};

@Injectable({ providedIn: 'root' })
export class CharacterGraphqlService {
  private apollo = inject(Apollo);
  private characterRest = inject(CharacterService);

  getAll(
    page: number,
    name?: string,
    status?: string,
  ): Observable<ApiResponse<Character>> {
    const filtreNom = name?.trim() || undefined;
    const filtreStatut = status || undefined;

    const variables: { page: number; name?: string; status?: string } = { page };
    if (filtreNom) variables.name = filtreNom;
    if (filtreStatut) variables.status = filtreStatut;

    return this.apollo
      .query<ReponseListe>({
        query: LISTE_PERSONNAGES,
        variables,
        fetchPolicy: 'cache-first',
      })
      .pipe(
        map((result) => {
          const bloc = result.data?.characters;
          if (!bloc) {
            throw new Error('Réponse GraphQL invalide');
          }
          return {
            info: bloc.info,
            results: bloc.results.map((p) => this.versCharacter(p)),
          };
        }),
        catchError(() =>
          this.characterRest.getAll(page, name, status),
        ),
      );
  }

  private versCharacter(p: PersonnageGraphql): Character {
    const base = 'https://rickandmortyapi.com/api';
    return {
      id: p.id,
      name: p.name,
      status: p.status,
      species: p.species,
      type: '',
      gender: '',
      image: p.image,
      origin: { name: '', url: '' },
      location: {
        name: p.location?.name ?? 'Inconnu',
        url: p.location ? `${base}/location/${p.location.id}` : '',
      },
      episode: p.episode.map((ep) => `${base}/episode/${ep.id}`),
      url: `${base}/character/${p.id}`,
    };
  }
}
