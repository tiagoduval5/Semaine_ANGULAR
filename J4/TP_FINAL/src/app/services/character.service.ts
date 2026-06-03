import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Character } from '../models/character.model';

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/character`;

  getAll(
    page: number,
    name?: string,
    status?: string,
  ): Observable<ApiResponse<Character>> {
    let params = new HttpParams().set('page', page);
    if (name?.trim()) params = params.set('name', name.trim());
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<Character>>(this.base, { params });
  }

  getById(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.base}/${id}`);
  }

  getMany(ids: number[]): Observable<Character[]> {
    if (ids.length === 0) return of([]);
    const idsParam = ids.slice(0, 20).join(',');
    return this.http
      .get<Character[] | Character>(`${this.base}/${idsParam}`)
      .pipe(map((res) => (Array.isArray(res) ? res : [res])));
  }
}
