export interface PokemonListResponse {
  count: number;
  results: { name: string; url: string }[];
}

export interface PokemonPreview {
  name: string;
  id: number;
  image: string;
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  sprites: {
    other: {
      'official-artwork': { front_default: string };
    };
  };
}
