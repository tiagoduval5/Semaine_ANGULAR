import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Episode } from '../models/episode.model';

@Injectable({ providedIn: 'root' })
export class EpisodeService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/episode`;

  getAll(page: number): Observable<ApiResponse<Episode>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<ApiResponse<Episode>>(this.base, { params });
  }

  getById(id: number): Observable<Episode> {
    return this.http.get<Episode>(`${this.base}/${id}`);
  }

  getMany(ids: number[]): Observable<Episode[]> {
    if (ids.length === 0) return of([]);
    const idsParam = ids.slice(0, 20).join(',');
    return this.http
      .get<Episode[] | Episode>(`${this.base}/${idsParam}`)
      .pipe(map((res) => (Array.isArray(res) ? res : [res])));
  }
}
