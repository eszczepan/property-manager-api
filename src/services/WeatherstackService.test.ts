import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WeatherstackService } from './WeatherstackService.js';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isAxiosError: vi.fn(),
  },
}));
const mockedAxios = axios as any;

describe('WeatherstackService', () => {
  let weatherService: WeatherstackService;

  beforeEach(() => {
    weatherService = new WeatherstackService('test-api-key');
    vi.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('should successfully fetch weather data', async () => {
      const mockResponse = {
        data: {
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
            weather_icons: [
              'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png',
            ],
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
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await weatherService.getCurrentWeather(
        'Phoenix',
        'AZ',
        '85001'
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.weatherstack.com/current',
        {
          params: {
            access_key: 'test-api-key',
            query: 'Phoenix, AZ 85001',
            units: 'm',
          },
          timeout: 15000,
        }
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const mockErrorResponse = {
        data: {
          error: {
            code: 101,
            type: 'invalid_access_key',
            info: 'You have not supplied a valid API Access Key.',
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockErrorResponse);

      await expect(
        weatherService.getCurrentWeather('Phoenix', 'AZ', '85001')
      ).rejects.toThrow('Invalid Weatherstack API key');
    });

    it('should handle missing weather data', async () => {
      const mockResponse = {
        data: {
          request: {},
          location: {},
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      await expect(
        weatherService.getCurrentWeather('Phoenix', 'AZ', '85001')
      ).rejects.toThrow(
        'No current weather data returned from Weatherstack API'
      );
    });

    it('should handle network timeout', async () => {
      const timeoutError = new Error('timeout of 10000ms exceeded');
      timeoutError.name = 'AxiosError';
      (timeoutError as any).code = 'ECONNABORTED';
      (timeoutError as any).isAxiosError = true;

      mockedAxios.get.mockRejectedValue(timeoutError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(
        weatherService.getCurrentWeather('Phoenix', 'AZ', '85001')
      ).rejects.toThrow('Weatherstack API timeout - please try again');
    });

    it('should handle 401 unauthorized', async () => {
      const unauthorizedError = {
        isAxiosError: true,
        response: { status: 401 },
        message: 'Request failed with status code 401',
      };

      mockedAxios.get.mockRejectedValue(unauthorizedError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(
        weatherService.getCurrentWeather('Phoenix', 'AZ', '85001')
      ).rejects.toThrow('Invalid Weatherstack API key');
    });

    it('should handle rate limit exceeded', async () => {
      const rateLimitError = {
        isAxiosError: true,
        response: { status: 429 },
        message: 'Request failed with status code 429',
      };

      mockedAxios.get.mockRejectedValue(rateLimitError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(
        weatherService.getCurrentWeather('Phoenix', 'AZ', '85001')
      ).rejects.toThrow('Too many requests - Weatherstack rate limit exceeded');
    });

    it('should handle general axios errors', async () => {
      const generalError = {
        isAxiosError: true,
        message: 'Network Error',
      };

      mockedAxios.get.mockRejectedValue(generalError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(
        weatherService.getCurrentWeather('Phoenix', 'AZ', '85001')
      ).rejects.toThrow('Weatherstack service error: Network Error');
    });

    it('should handle non-axios errors', async () => {
      const nonAxiosError = new Error('Some other error');

      mockedAxios.get.mockRejectedValue(nonAxiosError);
      mockedAxios.isAxiosError.mockReturnValue(false);

      await expect(
        weatherService.getCurrentWeather('Phoenix', 'AZ', '85001')
      ).rejects.toThrow('Some other error');
    });
  });

  describe('getMockWeatherData', () => {
    it('should return mock weather data', () => {
      const result = weatherService.getMockWeatherData(
        'Phoenix',
        'AZ',
        '85001'
      );

      expect(result.request.query).toBe('Phoenix, AZ 85001');
      expect(result.location.name).toBe('Phoenix');
      expect(result.location.region).toBe('AZ');
      expect(result.current.temperature).toBeGreaterThanOrEqual(10);
      expect(result.current.temperature).toBeLessThanOrEqual(40);
      expect(result.current.humidity).toBeGreaterThanOrEqual(30);
      expect(result.current.humidity).toBeLessThanOrEqual(80);
    });

    it('should return different data for different cities', () => {
      const result1 = weatherService.getMockWeatherData(
        'Phoenix',
        'AZ',
        '85001'
      );
      const result2 = weatherService.getMockWeatherData('Miami', 'FL', '33101');

      expect(result1.location.name).toBe('Phoenix');
      expect(result2.location.name).toBe('Miami');
      expect(result1.location.region).toBe('AZ');
      expect(result2.location.region).toBe('FL');
    });
  });
});
