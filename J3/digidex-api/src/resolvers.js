import { fetchDigimon, fetchDigimons } from './datasource.js';

function mapDigimon(raw) {
  if (!raw) return null;
  return {
    id: Number(raw.id),
    name: raw.name,
    releaseDate: raw.releaseDate,
    xAntibody: raw.xAntibody,
    images: raw.images ?? [],
    levels: (raw.levels ?? []).map((l) => l.level),
    types: (raw.types ?? []).map((t) => t.type),
    attributes: (raw.attributes ?? []).map((a) => a.attribute),
    descriptions: (raw.descriptions ?? [])
      .filter((d) => d.language === 'en_us')
      .map((d) => d.description),
    priorEvolutions: raw.priorEvolutions ?? [],
    nextEvolutions: raw.nextEvolutions ?? [],
  };
}

export const resolvers = {
  Query: {
    digimons: async (_parent, args) => fetchDigimons(args),
    digimon: async (_parent, { id }) => {
      const raw = await fetchDigimon(id);
      return mapDigimon(raw);
    },
    digimonByName: async (_parent, { name }) => {
      const raw = await fetchDigimon(name);
      return mapDigimon(raw);
    },
  },
};
