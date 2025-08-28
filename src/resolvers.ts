import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';
import { PropertyService } from './services/PropertyService.js';
import { CreatePropertyInput, PropertyFilters } from './types.js';

const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: unknown) {
    return value;
  },
  parseValue(value: unknown) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return JSON.parse(ast.value);
    }
    return null;
  },
});

const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: unknown) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value: unknown) {
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value);
    }
    throw new Error(
      'GraphQL DateTime Scalar parser expected a string or number'
    );
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

interface Context {
  propertyService: PropertyService;
}

export const resolvers = {
  JSON: JSONScalar,
  DateTime: DateTimeScalar,

  Query: {
    properties: async (
      _: unknown,
      args: {
        city?: string;
        state?: string;
        zipCode?: string;
        sortBy?: 'CREATED_AT' | 'CITY' | 'STATE';
        sortOrder?: 'ASC' | 'DESC';
        limit?: number;
        offset?: number;
      },
      context: Context
    ) => {
      try {
        const mapSortBy = (sortBy?: string): 'createdAt' | 'city' | 'state' => {
          if (!sortBy) return 'createdAt';
          switch (sortBy) {
            case 'CREATED_AT':
              return 'createdAt';
            case 'CITY':
              return 'city';
            case 'STATE':
              return 'state';
            default:
              return 'createdAt';
          }
        };

        const filters: PropertyFilters = {
          city: args.city,
          state: args.state,
          zipCode: args.zipCode,
          sortBy: mapSortBy(args.sortBy),
          sortOrder:
            (args.sortOrder?.toLowerCase() as 'asc' | 'desc') || 'desc',
          limit: args.limit || 50,
          offset: args.offset || 0,
        };

        return await context.propertyService.getProperties(filters);
      } catch (error) {
        throw new GraphQLError(
          `Failed to fetch properties: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          {
            extensions: {
              code: 'PROPERTIES_FETCH_ERROR',
            },
          }
        );
      }
    },

    property: async (_: unknown, args: { id: string }, context: Context) => {
      try {
        const property = await context.propertyService.getPropertyById(args.id);

        if (!property) {
          throw new GraphQLError('Property not found', {
            extensions: {
              code: 'PROPERTY_NOT_FOUND',
            },
          });
        }

        return property;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          `Failed to fetch property: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          {
            extensions: {
              code: 'PROPERTY_FETCH_ERROR',
            },
          }
        );
      }
    },

    health: () => {
      return 'OK';
    },
  },

  Mutation: {
    createProperty: async (
      _: unknown,
      args: { input: CreatePropertyInput },
      context: Context
    ) => {
      try {
        return await context.propertyService.createProperty(args.input);
      } catch (error) {
        throw new GraphQLError(
          `Failed to create property: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          {
            extensions: {
              code: 'PROPERTY_CREATE_ERROR',
            },
          }
        );
      }
    },

    deleteProperty: async (
      _: unknown,
      args: { id: string },
      context: Context
    ) => {
      try {
        return await context.propertyService.deleteProperty(args.id);
      } catch (error) {
        if (error instanceof Error && error.message === 'Property not found') {
          throw new GraphQLError('Property not found', {
            extensions: {
              code: 'PROPERTY_NOT_FOUND',
            },
          });
        }
        throw new GraphQLError(
          `Failed to delete property: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          {
            extensions: {
              code: 'PROPERTY_DELETE_ERROR',
            },
          }
        );
      }
    },
  },
};
