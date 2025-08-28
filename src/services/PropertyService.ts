import { Prisma, PrismaClient } from '@prisma/client';
import { CreatePropertyInput, Property, PropertyFilters } from '../types.js';
import { ValidationService } from './ValidationService.js';
import { WeatherstackService } from './WeatherstackService.js';

export class PropertyService {
  private prisma: PrismaClient;
  private weatherService: WeatherstackService;

  constructor(prisma: PrismaClient, weatherService: WeatherstackService) {
    this.prisma = prisma;
    this.weatherService = weatherService;
  }

  async createProperty(input: CreatePropertyInput): Promise<Property> {
    const sanitizedInput = ValidationService.sanitizeInput(input);
    const validation = ValidationService.validatePropertyInput(sanitizedInput);

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      const weatherData = await this.weatherService.getCurrentWeather(
        sanitizedInput.city,
        sanitizedInput.state,
        sanitizedInput.zipCode
      );

      const lat = parseFloat(weatherData.location.lat);
      const long = parseFloat(weatherData.location.lon);

      if (isNaN(lat) || isNaN(long)) {
        throw new Error('Invalid coordinates received from weather service');
      }

      const property = await this.prisma.property.create({
        data: {
          city: sanitizedInput.city,
          street: sanitizedInput.street,
          state: sanitizedInput.state,
          zipCode: sanitizedInput.zipCode,
          lat,
          long,
          weatherData: weatherData as any,
        },
      });

      return property as unknown as Property;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create property: ${error.message}`);
      }
      throw new Error('Failed to create property: Unknown error');
    }
  }

  async getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
    const {
      city,
      state,
      zipCode,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      offset = 0,
    } = filters;

    try {
      const where: Prisma.PropertyWhereInput = {};

      if (city) where.city = { contains: city, mode: 'insensitive' };
      if (state) where.state = state.toUpperCase();
      if (zipCode) where.zipCode = zipCode;

      const orderBy: Prisma.PropertyOrderByWithRelationInput = {};
      orderBy[sortBy] = sortOrder;

      const properties = await this.prisma.property.findMany({
        where,
        orderBy,
        take: Math.min(limit, 100),
        skip: offset,
      });

      return properties as unknown as Property[];
    } catch (error) {
      throw new Error(
        `Failed to fetch properties: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async getPropertyById(id: string): Promise<Property | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('Property ID is required');
    }

    try {
      const property = await this.prisma.property.findUnique({
        where: { id: id.trim() },
      });

      return property as unknown as Property | null;
    } catch (error) {
      throw new Error(
        `Failed to fetch property: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async deleteProperty(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('Property ID is required');
    }

    try {
      const existingProperty = await this.prisma.property.findUnique({
        where: { id: id.trim() },
      });

      if (!existingProperty) {
        throw new Error('Property not found');
      }

      await this.prisma.property.delete({
        where: { id: id.trim() },
      });

      return true;
    } catch (error) {
      if (error instanceof Error && error.message === 'Property not found') {
        throw error;
      }
      throw new Error(
        `Failed to delete property: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async getPropertiesCount(
    filters: Omit<
      PropertyFilters,
      'sortBy' | 'sortOrder' | 'limit' | 'offset'
    > = {}
  ): Promise<number> {
    const { city, state, zipCode } = filters;

    try {
      const where: Prisma.PropertyWhereInput = {};

      if (city) where.city = { contains: city, mode: 'insensitive' };
      if (state) where.state = state.toUpperCase();
      if (zipCode) where.zipCode = zipCode;

      return await this.prisma.property.count({ where });
    } catch (error) {
      throw new Error(
        `Failed to count properties: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
