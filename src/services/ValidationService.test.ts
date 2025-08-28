import { describe, expect, it } from 'vitest';
import { CreatePropertyInput } from '../types.js';
import { ValidationService } from './ValidationService.js';

describe('ValidationService', () => {
  describe('validatePropertyInput', () => {
    it('should validate correct input', () => {
      const input: CreatePropertyInput = {
        city: 'Phoenix',
        street: '123 Main St',
        state: 'AZ',
        zipCode: '85001',
      };

      const result = ValidationService.validatePropertyInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty city', () => {
      const input: CreatePropertyInput = {
        city: '',
        street: '123 Main St',
        state: 'AZ',
        zipCode: '85001',
      };

      const result = ValidationService.validatePropertyInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('City is required');
    });

    it('should reject empty street', () => {
      const input: CreatePropertyInput = {
        city: 'Phoenix',
        street: '',
        state: 'AZ',
        zipCode: '85001',
      };

      const result = ValidationService.validatePropertyInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Street is required');
    });

    it('should reject invalid state', () => {
      const input: CreatePropertyInput = {
        city: 'Phoenix',
        street: '123 Main St',
        state: 'XX',
        zipCode: '85001',
      };

      const result = ValidationService.validatePropertyInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Valid US state abbreviation is required (e.g., CA, NY, TX)'
      );
    });

    it('should reject invalid zip code', () => {
      const input: CreatePropertyInput = {
        city: 'Phoenix',
        street: '123 Main St',
        state: 'AZ',
        zipCode: '1234',
      };

      const result = ValidationService.validatePropertyInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Valid 5-digit zip code is required');
    });

    it('should reject zip code with letters', () => {
      const input: CreatePropertyInput = {
        city: 'Phoenix',
        street: '123 Main St',
        state: 'AZ',
        zipCode: '8500A',
      };

      const result = ValidationService.validatePropertyInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Valid 5-digit zip code is required');
    });

    it('should collect multiple errors', () => {
      const input: CreatePropertyInput = {
        city: '',
        street: '',
        state: 'XX',
        zipCode: '123',
      };

      const result = ValidationService.validatePropertyInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace and uppercase state', () => {
      const input: CreatePropertyInput = {
        city: '  Phoenix  ',
        street: '  123 Main St  ',
        state: '  az  ',
        zipCode: '  85001  ',
      };

      const result = ValidationService.sanitizeInput(input);
      expect(result.city).toBe('Phoenix');
      expect(result.street).toBe('123 Main St');
      expect(result.state).toBe('AZ');
      expect(result.zipCode).toBe('85001');
    });

    it('should handle empty strings', () => {
      const input: CreatePropertyInput = {
        city: '',
        street: '',
        state: '',
        zipCode: '',
      };

      const result = ValidationService.sanitizeInput(input);
      expect(result.city).toBe('');
      expect(result.street).toBe('');
      expect(result.state).toBe('');
      expect(result.zipCode).toBe('');
    });
  });
});
