import { CreatePropertyInput, US_STATES } from '../types.js';

export class ValidationService {
  static validatePropertyInput(input: CreatePropertyInput): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!input.city || input.city.trim().length === 0) {
      errors.push('City is required');
    }

    if (!input.street || input.street.trim().length === 0) {
      errors.push('Street is required');
    }

    if (
      !input.state ||
      !US_STATES.includes(input.state as (typeof US_STATES)[number])
    ) {
      errors.push('Valid US state abbreviation is required (e.g., CA, NY, TX)');
    }

    if (!input.zipCode || !/^\d{5}$/.test(input.zipCode)) {
      errors.push('Valid 5-digit zip code is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static sanitizeInput(input: CreatePropertyInput): CreatePropertyInput {
    return {
      city: input.city?.trim() || '',
      street: input.street?.trim() || '',
      state: input.state?.toUpperCase()?.trim() || '',
      zipCode: input.zipCode?.trim() || '',
    };
  }
}
