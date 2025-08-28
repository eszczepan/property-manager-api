import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolvers } from './resolvers.js';
import { PropertyService } from './services/PropertyService.js';
import { CreatePropertyInput, Property } from './types.js';

const mockPropertyService = {
  getProperties: vi.fn(),
  getPropertyById: vi.fn(),
  createProperty: vi.fn(),
  deleteProperty: vi.fn(),
} as unknown as PropertyService;

const mockContext = {
  propertyService: mockPropertyService,
};

describe('GraphQL Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Scalar Types', () => {
    it('should handle JSON scalar serialization', () => {
      const testData = { test: 'value', number: 123 };
      const result = resolvers.JSON.serialize(testData);
      expect(result).toEqual(testData);
    });

    it('should handle DateTime scalar serialization', () => {
      const testDate = new Date('2025-08-28T12:00:00Z');
      const result = resolvers.DateTime.serialize(testDate);
      expect(result).toBe('2025-08-28T12:00:00.000Z');
    });

    it('should handle DateTime scalar with string input', () => {
      const testDateString = '2025-08-28T12:00:00Z';
      const result = resolvers.DateTime.serialize(testDateString);
      expect(result).toBe(testDateString);
    });
  });

  describe('Query Resolvers', () => {
    describe('properties', () => {
      it('should fetch properties with default parameters', async () => {
        const mockProperties: Property[] = [
          {
            id: 'test-1',
            city: 'Phoenix',
            street: '123 Main St',
            state: 'AZ',
            zipCode: '85001',
            lat: 33.448,
            long: -112.074,
            weatherData: {} as any,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        vi.mocked(mockPropertyService.getProperties).mockResolvedValue(
          mockProperties
        );

        const result = await resolvers.Query.properties({}, {}, mockContext);

        expect(mockPropertyService.getProperties).toHaveBeenCalledWith({
          city: undefined,
          state: undefined,
          zipCode: undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          limit: 50,
          offset: 0,
        });
        expect(result).toEqual(mockProperties);
      });

      it('should fetch properties with filters', async () => {
        const mockProperties: Property[] = [];
        vi.mocked(mockPropertyService.getProperties).mockResolvedValue(
          mockProperties
        );

        await resolvers.Query.properties(
          {},
          {
            city: 'Phoenix',
            state: 'AZ',
            zipCode: '85001',
            sortBy: 'CITY',
            sortOrder: 'ASC',
            limit: 10,
            offset: 20,
          },
          mockContext
        );

        expect(mockPropertyService.getProperties).toHaveBeenCalledWith({
          city: 'Phoenix',
          state: 'AZ',
          zipCode: '85001',
          sortBy: 'city',
          sortOrder: 'asc',
          limit: 10,
          offset: 20,
        });
      });

      it('should handle STATE sort option', async () => {
        vi.mocked(mockPropertyService.getProperties).mockResolvedValue([]);

        await resolvers.Query.properties({}, { sortBy: 'STATE' }, mockContext);

        expect(mockPropertyService.getProperties).toHaveBeenCalledWith({
          city: undefined,
          state: undefined,
          zipCode: undefined,
          sortBy: 'state',
          sortOrder: 'desc',
          limit: 50,
          offset: 0,
        });
      });

      it('should handle service errors', async () => {
        vi.mocked(mockPropertyService.getProperties).mockRejectedValue(
          new Error('Service error')
        );

        await expect(
          resolvers.Query.properties({}, {}, mockContext)
        ).rejects.toThrow(GraphQLError);

        try {
          await resolvers.Query.properties({}, {}, mockContext);
        } catch (error) {
          expect(error).toBeInstanceOf(GraphQLError);
          expect((error as GraphQLError).message).toContain(
            'Failed to fetch properties: Service error'
          );
          expect((error as GraphQLError).extensions?.code).toBe(
            'PROPERTIES_FETCH_ERROR'
          );
        }
      });
    });

    describe('property', () => {
      it('should fetch single property', async () => {
        const mockProperty: Property = {
          id: 'test-1',
          city: 'Phoenix',
          street: '123 Main St',
          state: 'AZ',
          zipCode: '85001',
          lat: 33.448,
          long: -112.074,
          weatherData: {} as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        vi.mocked(mockPropertyService.getPropertyById).mockResolvedValue(
          mockProperty
        );

        const result = await resolvers.Query.property(
          {},
          { id: 'test-1' },
          mockContext
        );

        expect(mockPropertyService.getPropertyById).toHaveBeenCalledWith(
          'test-1'
        );
        expect(result).toEqual(mockProperty);
      });

      it('should throw error when property not found', async () => {
        vi.mocked(mockPropertyService.getPropertyById).mockResolvedValue(null);

        await expect(
          resolvers.Query.property({}, { id: 'non-existent' }, mockContext)
        ).rejects.toThrow(GraphQLError);

        try {
          await resolvers.Query.property(
            {},
            { id: 'non-existent' },
            mockContext
          );
        } catch (error) {
          expect(error).toBeInstanceOf(GraphQLError);
          expect((error as GraphQLError).message).toBe('Property not found');
          expect((error as GraphQLError).extensions?.code).toBe(
            'PROPERTY_NOT_FOUND'
          );
        }
      });

      it('should handle service errors', async () => {
        vi.mocked(mockPropertyService.getPropertyById).mockRejectedValue(
          new Error('Service error')
        );

        await expect(
          resolvers.Query.property({}, { id: 'test-1' }, mockContext)
        ).rejects.toThrow(GraphQLError);

        try {
          await resolvers.Query.property({}, { id: 'test-1' }, mockContext);
        } catch (error) {
          expect(error).toBeInstanceOf(GraphQLError);
          expect((error as GraphQLError).message).toContain(
            'Failed to fetch property: Service error'
          );
          expect((error as GraphQLError).extensions?.code).toBe(
            'PROPERTY_FETCH_ERROR'
          );
        }
      });

      it('should re-throw GraphQL errors', async () => {
        const graphQLError = new GraphQLError('Custom GraphQL error');
        vi.mocked(mockPropertyService.getPropertyById).mockRejectedValue(
          graphQLError
        );

        await expect(
          resolvers.Query.property({}, { id: 'test-1' }, mockContext)
        ).rejects.toThrow('Custom GraphQL error');
      });
    });

    describe('health', () => {
      it('should return OK', () => {
        const result = resolvers.Query.health();
        expect(result).toBe('OK');
      });
    });
  });

  describe('Mutation Resolvers', () => {
    describe('createProperty', () => {
      it('should create property successfully', async () => {
        const input: CreatePropertyInput = {
          city: 'Phoenix',
          street: '123 Main St',
          state: 'AZ',
          zipCode: '85001',
        };

        const mockCreatedProperty: Property = {
          id: 'new-id',
          ...input,
          lat: 33.448,
          long: -112.074,
          weatherData: {} as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        vi.mocked(mockPropertyService.createProperty).mockResolvedValue(
          mockCreatedProperty
        );

        const result = await resolvers.Mutation.createProperty(
          {},
          { input },
          mockContext
        );

        expect(mockPropertyService.createProperty).toHaveBeenCalledWith(input);
        expect(result).toEqual(mockCreatedProperty);
      });

      it('should handle creation errors', async () => {
        const input: CreatePropertyInput = {
          city: 'Phoenix',
          street: '123 Main St',
          state: 'AZ',
          zipCode: '85001',
        };

        vi.mocked(mockPropertyService.createProperty).mockRejectedValue(
          new Error('Creation failed')
        );

        await expect(
          resolvers.Mutation.createProperty({}, { input }, mockContext)
        ).rejects.toThrow(GraphQLError);

        try {
          await resolvers.Mutation.createProperty({}, { input }, mockContext);
        } catch (error) {
          expect(error).toBeInstanceOf(GraphQLError);
          expect((error as GraphQLError).message).toContain(
            'Failed to create property: Creation failed'
          );
          expect((error as GraphQLError).extensions?.code).toBe(
            'PROPERTY_CREATE_ERROR'
          );
        }
      });
    });

    describe('deleteProperty', () => {
      it('should delete property successfully', async () => {
        vi.mocked(mockPropertyService.deleteProperty).mockResolvedValue(true);

        const result = await resolvers.Mutation.deleteProperty(
          {},
          { id: 'test-id' },
          mockContext
        );

        expect(mockPropertyService.deleteProperty).toHaveBeenCalledWith(
          'test-id'
        );
        expect(result).toBe(true);
      });

      it('should handle property not found error', async () => {
        vi.mocked(mockPropertyService.deleteProperty).mockRejectedValue(
          new Error('Property not found')
        );

        await expect(
          resolvers.Mutation.deleteProperty(
            {},
            { id: 'non-existent' },
            mockContext
          )
        ).rejects.toThrow(GraphQLError);

        try {
          await resolvers.Mutation.deleteProperty(
            {},
            { id: 'non-existent' },
            mockContext
          );
        } catch (error) {
          expect(error).toBeInstanceOf(GraphQLError);
          expect((error as GraphQLError).message).toBe('Property not found');
          expect((error as GraphQLError).extensions?.code).toBe(
            'PROPERTY_NOT_FOUND'
          );
        }
      });

      it('should handle general deletion errors', async () => {
        vi.mocked(mockPropertyService.deleteProperty).mockRejectedValue(
          new Error('Database error')
        );

        await expect(
          resolvers.Mutation.deleteProperty({}, { id: 'test-id' }, mockContext)
        ).rejects.toThrow(GraphQLError);

        try {
          await resolvers.Mutation.deleteProperty(
            {},
            { id: 'test-id' },
            mockContext
          );
        } catch (error) {
          expect(error).toBeInstanceOf(GraphQLError);
          expect((error as GraphQLError).message).toContain(
            'Failed to delete property: Database error'
          );
          expect((error as GraphQLError).extensions?.code).toBe(
            'PROPERTY_DELETE_ERROR'
          );
        }
      });
    });
  });
});
