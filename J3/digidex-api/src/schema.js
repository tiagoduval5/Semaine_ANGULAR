export const typeDefs = `#graphql
  type Image {
    href: String
    transparent: Boolean
  }

  type Evolution {
    id: Int
    digimon: String
    condition: String
    image: String
  }

  type Digimon {
    id: Int!
    name: String!
    releaseDate: String
    xAntibody: Boolean
    images: [Image!]
    levels: [String!]
    types: [String!]
    attributes: [String!]
    descriptions: [String!]
    priorEvolutions: [Evolution!]
    nextEvolutions: [Evolution!]
  }

  type DigimonPage {
    items: [DigimonSummary!]!
    totalElements: Int
    totalPages: Int
    currentPage: Int
  }

  type DigimonSummary {
    id: Int!
    name: String!
    image: String
  }

  type Query {
    digimons(page: Int = 0, pageSize: Int = 20, name: String): DigimonPage!
    digimon(id: Int!): Digimon
    digimonByName(name: String!): Digimon
  }
`;
