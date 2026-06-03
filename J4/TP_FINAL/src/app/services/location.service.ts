import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Location } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/location`;

  getAll(page: number): Observable<ApiResponse<Location>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<ApiResponse<Location>>(this.base, { params });
  }

  getById(id: number): Observable<Location> {
    return this.http.get<Location>(`${this.base}/${id}`);
  }
}
