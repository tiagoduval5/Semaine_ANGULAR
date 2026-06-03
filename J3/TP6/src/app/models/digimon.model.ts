export interface Image {
  href: string;
  transparent: boolean;
}

export interface Evolution {
  id: number;
  digimon: string;
  condition: string;
  image: string;
}

export interface Digimon {
  id: number;
  name: string;
  releaseDate?: string;
  images?: Image[];
  levels?: string[];
  types?: string[];
  attributes?: string[];
  descriptions?: string[];
  priorEvolutions?: Evolution[];
  nextEvolutions?: Evolution[];
}

export interface DigimonSummary {
  id: number;
  name: string;
  image: string;
}

export interface DigimonPage {
  items: DigimonSummary[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}
