import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Card, CardFilters, CardResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class CardApiService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  getCards(filters: CardFilters = {}, num = 24, offset = 0): Observable<CardResponse> {
    let params = new HttpParams().set('num', num).set('offset', offset);

    if (filters.fname) params = params.set('fname', filters.fname);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.attribute) params = params.set('attribute', filters.attribute);
    if (filters.archetype) params = params.set('archetype', filters.archetype);

    return this.http.get<CardResponse>(`${this.base}/cardinfo.php`, { params });
  }

  getCardById(id: number): Observable<Card> {
    const params = new HttpParams().set('id', id);
    return this.http
      .get<CardResponse>(`${this.base}/cardinfo.php`, { params })
      .pipe(map((res) => res.data[0]));
  }

  getRandomCard(): Observable<Card> {
    return this.http
      .get<Card>(`${this.base}/randomcard.php`)
      .pipe(catchError(() => this.getRandomCardFallback()));
  }

  private getRandomCardFallback(): Observable<Card> {
    // Certains navigateurs/contexte reseau peuvent faire echouer randomcard.php.
    // Fallback: on tire une carte "pseudo-aleatoire" via cardinfo.php.
    const randomOffset = Math.floor(Math.random() * 12000);
    const params = new HttpParams().set('num', 1).set('offset', randomOffset);
    return this.http
      .get<CardResponse>(`${this.base}/cardinfo.php`, { params })
      .pipe(map((res) => res.data[0]));
  }
}
