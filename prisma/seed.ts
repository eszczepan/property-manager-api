import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleProperties = [
  {
    city: 'Phoenix',
    street: '123 Main Street',
    state: 'AZ',
    zipCode: '85001',
    lat: 33.4484,
    long: -112.074,
    weatherData: {
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
        localtime: '2025-08-28 14:30',
        localtime_epoch: 1705329000,
        utc_offset: '-7.0',
      },
      current: {
        observation_time: '09:30 PM',
        temperature: 22,
        weather_code: 113,
        weather_icons: [
          'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png',
        ],
        weather_descriptions: ['Sunny'],
        wind_speed: 8,
        wind_degree: 270,
        wind_dir: 'W',
        pressure: 1013,
        precip: 0,
        humidity: 35,
        cloudcover: 0,
        feelslike: 22,
        uv_index: 7,
        visibility: 16,
        is_day: 'yes',
      },
    },
  },
  {
    city: 'Miami',
    street: '456 Ocean Drive',
    state: 'FL',
    zipCode: '33139',
    lat: 25.7617,
    long: -80.1918,
    weatherData: {
      request: {
        type: 'City',
        query: 'Miami, FL 33139',
        language: 'en',
        unit: 'm',
      },
      location: {
        name: 'Miami',
        country: 'United States of America',
        region: 'Florida',
        lat: '25.762',
        lon: '-80.192',
        timezone_id: 'America/New_York',
        localtime: '2025-08-28 17:30',
        localtime_epoch: 1705340200,
        utc_offset: '-5.0',
      },
      current: {
        observation_time: '10:30 PM',
        temperature: 28,
        weather_code: 116,
        weather_icons: [
          'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png',
        ],
        weather_descriptions: ['Partly cloudy'],
        wind_speed: 12,
        wind_degree: 120,
        wind_dir: 'ESE',
        pressure: 1015,
        precip: 0,
        humidity: 78,
        cloudcover: 25,
        feelslike: 31,
        uv_index: 8,
        visibility: 10,
        is_day: 'yes',
      },
    },
  },
  {
    city: 'New York',
    street: '789 Broadway',
    state: 'NY',
    zipCode: '10003',
    lat: 40.7128,
    long: -74.006,
    weatherData: {
      request: {
        type: 'City',
        query: 'New York, NY 10003',
        language: 'en',
        unit: 'm',
      },
      location: {
        name: 'New York',
        country: 'United States of America',
        region: 'New York',
        lat: '40.713',
        lon: '-74.006',
        timezone_id: 'America/New_York',
        localtime: '2025-08-28 17:30',
        localtime_epoch: 1705340200,
        utc_offset: '-5.0',
      },
      current: {
        observation_time: '10:30 PM',
        temperature: 5,
        weather_code: 296,
        weather_icons: [
          'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0017_cloudy_with_light_rain.png',
        ],
        weather_descriptions: ['Light rain'],
        wind_speed: 15,
        wind_degree: 230,
        wind_dir: 'SW',
        pressure: 1012,
        precip: 2,
        humidity: 85,
        cloudcover: 75,
        feelslike: 2,
        uv_index: 1,
        visibility: 8,
        is_day: 'no',
      },
    },
  },
  {
    city: 'Los Angeles',
    street: '321 Sunset Boulevard',
    state: 'CA',
    zipCode: '90028',
    lat: 34.0522,
    long: -118.2437,
    weatherData: {
      request: {
        type: 'City',
        query: 'Los Angeles, CA 90028',
        language: 'en',
        unit: 'm',
      },
      location: {
        name: 'Los Angeles',
        country: 'United States of America',
        region: 'California',
        lat: '34.052',
        lon: '-118.244',
        timezone_id: 'America/Los_Angeles',
        localtime: '2025-08-28 14:30',
        localtime_epoch: 1705329000,
        utc_offset: '-8.0',
      },
      current: {
        observation_time: '10:30 PM',
        temperature: 18,
        weather_code: 143,
        weather_icons: [
          'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0006_mist.png',
        ],
        weather_descriptions: ['Mist'],
        wind_speed: 6,
        wind_degree: 270,
        wind_dir: 'W',
        pressure: 1016,
        precip: 0,
        humidity: 82,
        cloudcover: 50,
        feelslike: 18,
        uv_index: 5,
        visibility: 6,
        is_day: 'yes',
      },
    },
  },
  {
    city: 'Chicago',
    street: '555 Michigan Avenue',
    state: 'IL',
    zipCode: '60611',
    lat: 41.8781,
    long: -87.6298,
    weatherData: {
      request: {
        type: 'City',
        query: 'Chicago, IL 60611',
        language: 'en',
        unit: 'm',
      },
      location: {
        name: 'Chicago',
        country: 'United States of America',
        region: 'Illinois',
        lat: '41.878',
        lon: '-87.630',
        timezone_id: 'America/Chicago',
        localtime: '2025-08-28 16:30',
        localtime_epoch: 1705336600,
        utc_offset: '-6.0',
      },
      current: {
        observation_time: '10:30 PM',
        temperature: -5,
        weather_code: 230,
        weather_icons: [
          'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0021_cloudy_with_sleet.png',
        ],
        weather_descriptions: ['Blizzard'],
        wind_speed: 25,
        wind_degree: 350,
        wind_dir: 'N',
        pressure: 1008,
        precip: 8,
        humidity: 90,
        cloudcover: 100,
        feelslike: -12,
        uv_index: 1,
        visibility: 2,
        is_day: 'no',
      },
    },
  },
];

async function main() {
  console.log('🌱 Starting database seed...');
  await prisma.property.deleteMany();
  console.log('🧹 Cleared existing properties');

  for (const property of sampleProperties) {
    await prisma.property.create({
      data: property,
    });
  }

  console.log(`✅ Created ${sampleProperties.length} sample properties`);
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
