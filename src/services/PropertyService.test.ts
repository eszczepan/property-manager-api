import { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreatePropertyInput, WeatherData } from '../types.js';
import { PropertyService } from './PropertyService.js';
import { WeatherstackService } from './WeatherstackService.js';

const mockPrisma = {
  property: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $connect: vi.fn(),
  $disconnect: vi.fn(),
} as unknown as PrismaClient;

const mockWeatherService = {
  getCurrentWeather: vi.fn(),
  getMockWeatherData: vi.fn(),
} as unknown as WeatherstackService;

describe('PropertyService', () => {
  let propertyService: PropertyService;

  beforeEach(() => {
    propertyService = new PropertyService(mockPrisma, mockWeatherService);
    vi.clearAllMocks();
  });

  const mockWeatherData: WeatherData = {
    request: {
      type: 'City',
      query: 'Phoenix, AZ 85001',
      language: 'en',
      unit: 'm',
    },
    location: {
      name: 'Phoenix',
      country: 'United States of America',
      region: 'Arizona',
      lat: '33.448',
      lon: '-112.074',
      timezone_id: 'America/Phoenix',
      localtime: '2025-08-28 12:00',
      localtime_epoch: 1724858400,
      utc_offset: '-7.0',
    },
    current: {
      observation_time: '07:00 PM',
      temperature: 25,
      weather_code: 113,
      weather_icons: ['https://example.com/sunny.png'],
      weather_descriptions: ['Sunny'],
      wind_speed: 10,
      wind_degree: 180,
      wind_dir: 'S',
      pressure: 1013,
      precip: 0,
      humidity: 45,
      cloudcover: 0,
      feelslike: 25,
      uv_index: 8,
      visibility: 10,
      is_day: 'yes',
    },
  };

  describe('createProperty', () => {
    it('should create property successfully', async () => {
      const input: CreatePropertyInput = {
        city: 'Phoenix',
        street: '123 Main St',
        state: 'AZ',
        zipCode: '85001',
      };

      const mockCreatedProperty = {
        id: 'test-id',
        ...input,
        lat: 33.448,
        long: -112.074,
        weatherData: mockWeatherData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockWeatherService.getCurrentWeather).mockResolvedValue(
        mockWeatherData
      );
      vi.mocked(mockPrisma.property.create).mockResolvedValue(
        mockCreatedProperty as any
      );

      const result = await propertyService.createProperty(input);

      expect(mockWeatherService.getCurrentWeather).toHaveBeenCalledWith(
        'Phoenix',
        'AZ',
        '85001'
      );
      expect(mockPrisma.property.create).toHaveBeenCalledWith({
        data: {
          city: 'Phoenix',
          street: '123 Main St',
          state: 'AZ',
          zipCode: '85001',
          lat: 33.448,
          long: -112.074,
          weatherData: mockWeatherData,
        },
      });
      expect(result).toEqual(mockCreatedProperty);
    });

    it('should reject invalid input', async () => {
      const input: CreatePropertyInput = {
        city: '',
        street: '123 Main St',
        state: 'AZ',
        zipCode: '85001',
      };

      await expect(propertyService.createProperty(input)).rejects.toThrow(
        'Validation failed: City is required'
      );
    });

    it('should handle weather service errors', async () => {
      const input: CreatePropertyInput = {
        city: 'Phoenix',
        street: '123 Main St',
        state: 'AZ',
        zipCode: '85001',
      };

      vi.mocked(mockWeatherService.getCurrentWeather).mockRejectedValue(
        new Error('Weather API error')
      );

      await expect(propertyService.createProperty(input)).rejects.toThrow(
        'Failed to create property: Weather API error'
      );
    });

    it('should handle invalid coordinates', async () => {
      const input: CreatePropertyInput = {
        city: 'Phoenix',
        street: '123 Main St',
        state: 'AZ',
        zipCode: '85001',
      };

      const invalidWeatherData = {
        ...mockWeatherData,
        location: {
          ...mockWeatherData.location,
          lat: 'invalid',
          lon: 'invalid',
        },
      };

      vi.mocked(mockWeatherService.getCurrentWeather).mockResolvedValue(
        invalidWeatherData as any
      );

      await expect(propertyService.createProperty(input)).rejects.toThrow(
        'Failed to create property: Invalid coordinates received from weather service'
      );
    });

    it('should sanitize input before validation', async () => {
      const input: CreatePropertyInput = {
        city: '  Phoenix  ',
        street: '  123 Main St  ',
        state: '  az  ',
        zipCode: '  85001  ',
      };

      const mockCreatedProperty = {
        id: 'test-id',
        city: 'Phoenix',
        street: '123 Main St',
        state: 'AZ',
        zipCode: '85001',
        lat: 33.448,
        long: -112.074,
        weatherData: mockWeatherData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockWeatherService.getCurrentWeather).mockResolvedValue(
        mockWeatherData
      );
      vi.mocked(mockPrisma.property.create).mockResolvedValue(
        mockCreatedProperty as any
      );

      const result = await propertyService.createProperty(input);

      expect(mockWeatherService.getCurrentWeather).toHaveBeenCalledWith(
        'Phoenix',
        'AZ',
        '85001'
      );
      expect(result.city).toBe('Phoenix');
      expect(result.state).toBe('AZ');
    });
  });

  describe('getProperties', () => {
    it('should fetch properties with filters', async () => {
      const mockProperties = [
        {
          id: 'test-id-1',
          city: 'Phoenix',
          street: '123 Main St',
          state: 'AZ',
          zipCode: '85001',
          lat: 33.448,
          long: -112.074,
          weatherData: mockWeatherData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(mockPrisma.property.findMany).mockResolvedValue(
        mockProperties as any
      );

      const result = await propertyService.getProperties({
        city: 'Phoenix',
        state: 'AZ',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(mockPrisma.property.findMany).toHaveBeenCalledWith({
        where: {
          city: { contains: 'Phoenix', mode: 'insensitive' },
          state: 'AZ',
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
      expect(result).toEqual(mockProperties);
    });

    it('should fetch properties with default parameters', async () => {
      const mockProperties: any[] = [];
      vi.mocked(mockPrisma.property.findMany).mockResolvedValue(
        mockProperties as any
      );

      const result = await propertyService.getProperties();

      expect(mockPrisma.property.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
      expect(result).toEqual(mockProperties);
    });

    it('should limit maximum records to 100', async () => {
      vi.mocked(mockPrisma.property.findMany).mockResolvedValue([]);

      await propertyService.getProperties({ limit: 200 });

      expect(mockPrisma.property.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 100,
        skip: 0,
      });
    });

    it('should handle database errors', async () => {
      vi.mocked(mockPrisma.property.findMany).mockRejectedValue(
        new Error('Database error')
      );

      await expect(propertyService.getProperties()).rejects.toThrow(
        'Failed to fetch properties: Database error'
      );
    });
  });

  describe('getPropertyById', () => {
    it('should fetch property by id', async () => {
      const mockProperty = {
        id: 'test-id',
        city: 'Phoenix',
        street: '123 Main St',
        state: 'AZ',
        zipCode: '85001',
        lat: 33.448,
        long: -112.074,
        weatherData: mockWeatherData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockPrisma.property.findUnique).mockResolvedValue(
        mockProperty as any
      );

      const result = await propertyService.getPropertyById('test-id');

      expect(mockPrisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(result).toEqual(mockProperty);
    });

    it('should return null for non-existent property', async () => {
      vi.mocked(mockPrisma.property.findUnique).mockResolvedValue(null);

      const result = await propertyService.getPropertyById('non-existent');

      expect(result).toBeNull();
    });

    it('should reject empty id', async () => {
      await expect(propertyService.getPropertyById('')).rejects.toThrow(
        'Property ID is required'
      );
    });

    it('should trim whitespace from id', async () => {
      vi.mocked(mockPrisma.property.findUnique).mockResolvedValue(null);

      await propertyService.getPropertyById('  test-id  ');

      expect(mockPrisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });
  });

  describe('deleteProperty', () => {
    it('should delete property successfully', async () => {
      const mockProperty = { id: 'test-id' };

      vi.mocked(mockPrisma.property.findUnique).mockResolvedValue(
        mockProperty as any
      );
      vi.mocked(mockPrisma.property.delete).mockResolvedValue(
        mockProperty as any
      );

      const result = await propertyService.deleteProperty('test-id');

      expect(mockPrisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(mockPrisma.property.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(result).toBe(true);
    });

    it('should reject deletion of non-existent property', async () => {
      vi.mocked(mockPrisma.property.findUnique).mockResolvedValue(null);

      await expect(
        propertyService.deleteProperty('non-existent')
      ).rejects.toThrow('Property not found');
    });

    it('should reject empty id', async () => {
      await expect(propertyService.deleteProperty('')).rejects.toThrow(
        'Property ID is required'
      );
    });

    it('should handle database errors', async () => {
      const mockProperty = { id: 'test-id' };
      vi.mocked(mockPrisma.property.findUnique).mockResolvedValue(
        mockProperty as any
      );
      vi.mocked(mockPrisma.property.delete).mockRejectedValue(
        new Error('Database error')
      );

      await expect(propertyService.deleteProperty('test-id')).rejects.toThrow(
        'Failed to delete property: Database error'
      );
    });
  });

  describe('getPropertiesCount', () => {
    it('should count properties with filters', async () => {
      vi.mocked(mockPrisma.property.count).mockResolvedValue(5);

      const result = await propertyService.getPropertiesCount({
        city: 'Phoenix',
        state: 'AZ',
      });

      expect(mockPrisma.property.count).toHaveBeenCalledWith({
        where: {
          city: { contains: 'Phoenix', mode: 'insensitive' },
          state: 'AZ',
        },
      });
      expect(result).toBe(5);
    });

    it('should count all properties when no filters', async () => {
      vi.mocked(mockPrisma.property.count).mockResolvedValue(10);

      const result = await propertyService.getPropertiesCount();

      expect(mockPrisma.property.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toBe(10);
    });
  });
});
