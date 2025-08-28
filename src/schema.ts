export const typeDefs = /* GraphQL */ `
  scalar JSON
  scalar DateTime

  type Property {
    id: String!
    city: String!
    street: String!
    state: String!
    zipCode: String!
    lat: Float!
    long: Float!
    weatherData: JSON!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    properties(
      city: String
      state: String
      zipCode: String
      sortBy: SortOption = CREATED_AT
      sortOrder: SortOrder = DESC
      limit: Int = 50
      offset: Int = 0
    ): [Property!]!

    property(id: String!): Property

    health: String!
  }

  type Mutation {
    createProperty(input: CreatePropertyInput!): Property!
    deleteProperty(id: String!): Boolean!
  }

  input CreatePropertyInput {
    city: String!
    street: String!
    state: String!
    zipCode: String!
  }

  enum SortOption {
    CREATED_AT
    CITY
    STATE
  }

  enum SortOrder {
    ASC
    DESC
  }
`;
