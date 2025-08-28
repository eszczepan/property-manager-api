export interface Property {
  id: string;
  city: string;
  street: string;
  state: string;
  zipCode: string;
  lat: number;
  long: number;
  weatherData: WeatherData;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyInput {
  city: string;
  street: string;
  state: string;
  zipCode: string;
}

export interface WeatherData {
  request: {
    type: string;
    query: string;
    language: string;
    unit: string;
  };
  location: {
    name: string;
    country: string;
    region: string;
    lat: string;
    lon: string;
    timezone_id: string;
    localtime: string;
    localtime_epoch: number;
    utc_offset: string;
  };
  current: {
    observation_time: string;
    temperature: number;
    weather_code: number;
    weather_icons: string[];
    weather_descriptions: string[];
    wind_speed: number;
    wind_degree: number;
    wind_dir: string;
    pressure: number;
    precip: number;
    humidity: number;
    cloudcover: number;
    feelslike: number;
    uv_index: number;
    visibility: number;
    is_day: string;
  };
}

export interface PropertyFilters {
  city?: string;
  state?: string;
  zipCode?: string;
  sortBy?: 'createdAt' | 'city' | 'state';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
] as const;

export type USState = (typeof US_STATES)[number];
