import axios from 'axios';
import { WeatherData } from '../types.js';

export class WeatherstackService {
  private apiKey: string;
  private baseUrl = 'https://api.weatherstack.com/current';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCurrentWeather(
    city: string,
    state: string,
    zipCode: string
  ): Promise<WeatherData> {
    if (this.apiKey === 'demo_key' || this.apiKey === 'mock') {
      console.log(
        `🌤️  Using mock weather data for ${city}, ${state} ${zipCode}`
      );
      return this.getMockWeatherData(city, state, zipCode);
    }
    try {
      // Format query as recommended by Weatherstack docs
      const query = `${city}, ${state} ${zipCode}`;

      console.log(
        `🌐 Fetching real weather data from Weatherstack for: ${query}`
      );

      const response = await axios.get(this.baseUrl, {
        params: {
          access_key: this.apiKey,
          query: query,
          units: 'm',
        },
        timeout: 15000,
      });

      if (response.data.error) {
        const errorCode = response.data.error.code;
        const errorInfo = response.data.error.info;

        switch (errorCode) {
          case 101:
            throw new Error('Invalid Weatherstack API key');
          case 429:
            throw new Error('API request limit reached for this month');
          case 601:
            throw new Error(`Invalid location: ${query}`);
          case 615:
            throw new Error('Weatherstack API request failed');
          default:
            throw new Error(
              `Weatherstack API error (${errorCode}): ${errorInfo}`
            );
        }
      }

      if (!response.data.success && response.data.success === false) {
        throw new Error('Weatherstack API returned unsuccessful response');
      }

      if (!response.data.current) {
        throw new Error(
          'No current weather data returned from Weatherstack API'
        );
      }

      if (!response.data.location) {
        throw new Error('No location data returned from Weatherstack API');
      }

      console.log(
        `✅ Successfully fetched weather data for ${response.data.location.name}`
      );
      return response.data as WeatherData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Weatherstack API timeout - please try again');
        }
        if (error.response?.status === 401) {
          throw new Error('Unauthorized - Invalid Weatherstack API key');
        }
        if (error.response?.status === 429) {
          throw new Error(
            'Too many requests - Weatherstack rate limit exceeded'
          );
        }
        if (error.response?.status === 403) {
          throw new Error(
            'Forbidden - Current plan does not support this feature'
          );
        }
        if (error.response?.status === 404) {
          throw new Error('Weatherstack API endpoint not found');
        }
        throw new Error(`Weatherstack service error: ${error.message}`);
      }
      throw error;
    }
  }

  getMockWeatherData(
    city: string,
    state: string,
    _zipCode: string
  ): WeatherData {
    const coordinates = this.generateCoordinates(city, state);

    return {
      request: {
        type: 'City',
        query: `${city}, ${state} ${_zipCode}`,
        language: 'en',
        unit: 'm',
      },
      location: {
        name: city,
        country: 'United States of America',
        region: state,
        lat: coordinates.lat.toString(),
        lon: coordinates.long.toString(),
        timezone_id: this.getTimezone(state),
        localtime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        localtime_epoch: Math.floor(Date.now() / 1000),
        utc_offset: this.getUtcOffset(state),
      },
      current: {
        observation_time: new Date().toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
        }),
        temperature: Math.floor(Math.random() * 30) + 10,
        weather_code: 113,
        weather_icons: [
          'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png',
        ],
        weather_descriptions: ['Sunny'],
        wind_speed: Math.floor(Math.random() * 20) + 5,
        wind_degree: Math.floor(Math.random() * 360),
        wind_dir: 'SW',
        pressure: 1013,
        precip: 0,
        humidity: Math.floor(Math.random() * 50) + 30,
        cloudcover: Math.floor(Math.random() * 30),
        feelslike: Math.floor(Math.random() * 30) + 10,
        uv_index: Math.floor(Math.random() * 10),
        visibility: 10,
        is_day: 'yes',
      },
    };
  }

  private generateCoordinates(
    city: string,
    _state: string
  ): { lat: number; long: number } {
    const hash = city
      .toLowerCase()
      .split('')
      .reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);

    const lat = 24 + Math.abs(hash % 25000) / 1000;
    const long = -125 + Math.abs(hash % 59000) / 1000;

    return {
      lat: Math.round(lat * 1000) / 1000,
      long: Math.round(long * 1000) / 1000,
    };
  }

  private getTimezone(state: string): string {
    const timezones: { [key: string]: string } = {
      CA: 'America/Los_Angeles',
      NY: 'America/New_York',
      FL: 'America/New_York',
      TX: 'America/Chicago',
      IL: 'America/Chicago',
      AZ: 'America/Phoenix',
    };
    return timezones[state] || 'America/New_York';
  }

  private getUtcOffset(state: string): string {
    const offsets: { [key: string]: string } = {
      CA: '-8.0',
      NY: '-5.0',
      FL: '-5.0',
      TX: '-6.0',
      IL: '-6.0',
      AZ: '-7.0',
    };
    return offsets[state] || '-5.0';
  }

  /**
   * Test the API connection
   * Useful for validating API key and service availability
   */
  async testConnection(): Promise<boolean> {
    if (this.apiKey === 'demo_key' || this.apiKey === 'mock') {
      console.log('🧪 Testing connection with mock service');
      return true;
    }

    try {
      console.log('🧪 Testing Weatherstack API connection...');

      const response = await axios.get(this.baseUrl, {
        params: {
          access_key: this.apiKey,
          query: 'New York',
          units: 'm',
        },
        timeout: 10000,
      });

      if (response.data.error) {
        console.error(`❌ API test failed: ${response.data.error.info}`);
        return false;
      }

      if (response.data.current && response.data.location) {
        console.log('✅ Weatherstack API connection test successful');
        return true;
      }

      console.error('❌ API test failed: Invalid response structure');
      return false;
    } catch (error) {
      console.error(`❌ API connection test failed: ${error}`);
      return false;
    }
  }
}
