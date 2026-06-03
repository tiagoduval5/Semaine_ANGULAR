import { Injectable, inject } from '@angular/core';
import { Apollo, QueryRef, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { Digimon, DigimonPage } from '../models/digimon.model';

const LISTE = gql`
  query Digimons($page: Int!, $pageSize: Int!, $name: String) {
    digimons(page: $page, pageSize: $pageSize, name: $name) {
      totalElements
      totalPages
      currentPage
      items {
        id
        name
        image
      }
    }
  }
`;

const DETAIL = gql`
  query Digimon($id: Int!) {
    digimon(id: $id) {
      id
      name
      releaseDate
      levels
      types
      attributes
      descriptions
      images {
        href
      }
      priorEvolutions {
        id
        digimon
        condition
        image
      }
      nextEvolutions {
        id
        digimon
        condition
        image
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class DigimonGraphqlService {
  private apollo = inject(Apollo);

  createDigimonsQuery(pageSize = 20, name?: string): QueryRef<{ digimons: DigimonPage }> {
    return this.apollo.watchQuery<{ digimons: DigimonPage }>({
      query: LISTE,
      variables: { page: 0, pageSize, name },
      errorPolicy: 'all',
    });
  }

  getDigimons(page = 0, pageSize = 20, name?: string): Observable<DigimonPage> {
    return this.apollo
      .watchQuery<{ digimons: DigimonPage }>({
        query: LISTE,
        variables: { page, pageSize, name },
        errorPolicy: 'all',
      })
      .valueChanges.pipe(
        map(
          (result) =>
            (result.data?.digimons as DigimonPage | undefined) ?? {
              items: [],
              totalElements: 0,
              totalPages: 0,
              currentPage: page,
            },
        ),
      );
  }

  getDigimon(id: number): Observable<Digimon> {
    return this.apollo
      .watchQuery<{ digimon: Digimon }>({
        query: DETAIL,
        variables: { id },
        errorPolicy: 'all',
      })
      .valueChanges.pipe(
        map((result) => {
          if (!result.data?.digimon) {
            throw new Error('Digimon introuvable ou reponse GraphQL invalide');
          }
          return result.data.digimon as Digimon;
        }),
      );
  }
}
