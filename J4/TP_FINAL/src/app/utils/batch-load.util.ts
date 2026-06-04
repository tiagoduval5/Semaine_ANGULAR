import { concatMap, from, map, Observable, of, toArray } from 'rxjs';

/** Charge les lots l'un après l'autre pour limiter le rate-limit de l'API. */
export function chargerParLots<T>(
  lots: number[][],
  fetchLot: (ids: number[]) => Observable<T[]>,
): Observable<T[]> {
  if (lots.length === 0) return of([]);
  return from(lots).pipe(
    concatMap((lot) => fetchLot(lot)),
    toArray(),
    map((pages) => pages.flat()),
  );
}
