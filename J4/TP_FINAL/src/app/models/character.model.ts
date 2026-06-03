export interface LienRessource {
  name: string;
  url: string;
}

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  image: string;
  origin: LienRessource;
  location: LienRessource;
  episode: string[];
  url: string;
}
