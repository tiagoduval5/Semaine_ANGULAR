import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  PokemonListResponse,
  PokemonPreview,
  PokemonDetail,
} from '../models/pokemon.model';

@Injectable({ providedIn: 'root' })
export class PokemonApiService {
  private http = inject(HttpClient);
  private baseUrl = 'https://pokeapi.co/api/v2';

  getList(
    limit = 151,
    offset = 0,
  ): Observable<{ items: PokemonPreview[]; total: number; hasMore: boolean }> {
    return this.http
      .get<PokemonListResponse>(
        `${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`,
      )
      .pipe(
        map((res) => ({
          items: res.results.map((p) => {
            const id = Number(p.url.split('/').filter(Boolean).pop());
            return {
              name: p.name,
              id,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            };
          }),
          total: res.count,
          hasMore: res.next !== null,
        })),
      );
  }

  getByName(name: string): Observable<PokemonDetail> {
    return this.http.get<PokemonDetail>(`${this.baseUrl}/pokemon/${name}`);
  }
}
