import { Info } from './info.model';

export interface ApiResponse<T> {
  info: Info;
  results: T[];
}
