import { describe, it, expect } from 'vitest';
import { generateNewLabel } from './relabelr';

describe('generateNewLabel', () => {
  // Reset module state before each test

  describe('basic functionality', () => {
    it('should use the provided label if it does not exist', () => {
      const result = generateNewLabel('My Columns', [ 'My Columns copy' ]);

      expect(result).toBe('My Columns');
    });

    it('should generate a label with "copy 2" when "copy 1" already exists', () => {
      const labels = [ 'My Columns', 'My Columns copy' ];
      const result = generateNewLabel('My Columns', labels);

      expect(result).toBe('My Columns copy 2');
    });

    it('should find the lowest available number when there are gaps', () => {
      const labels = [ 'My Columns', 'My Columns copy', 'My Columns copy 3', 'My Columns copy 4' ];
      const result = generateNewLabel('My Columns', labels);

      expect(result).toBe('My Columns copy 2');
    });
  });

  describe('handling labels with "Copy" already in them', () => {
    it('should extract the base label from a label with "Copy" in it', () => {
      const labels: string[] = [];
      const result = generateNewLabel('My Columns copy 3', labels);

      expect(result).toBe('My Columns copy 3');
    });

    it('should handle multiple levels of copying correctly', () => {
      const labels = [ 'My Columns', 'My Columns copy' ];
      const result = generateNewLabel('My Columns copy', labels);

      expect(result).toBe('My Columns copy 2');
    });

    it('should respect the base label when determining the next counter', () => {
      const labels = [
        'First Columns',
        'First Columns copy',
        'First Columns copy 2',
        'Second Columns copy 1',
      ];
      const result = generateNewLabel('First Columns', labels);

      expect(result).toBe('First Columns copy 3');
    });
  });

  describe('handling multiple calls for the same label', () => {
    it('should increment the counter for consecutive copies of the same label', () => {
      const labels: string[] = [];

      // First call
      const result1 = generateNewLabel('Test Label', labels);

      expect(result1).toBe('Test Label');

      // Add the result to labels
      labels.push(result1);

      // Second call
      const result2 = generateNewLabel('Test Label', labels);

      expect(result2).toBe('Test Label copy');

      // Add the result to labels
      labels.push(result2);

      // Third call
      const result3 = generateNewLabel('Test Label', labels);

      expect(result3).toBe('Test Label copy 2');
    });

    it('should use module-level existingCounters to track used numbers', () => {
      const result1 = generateNewLabel('Test', [ 'Test' ]);

      expect(result1).toBe('Test copy');

      const result2 = generateNewLabel('Test', [ 'Test', 'Test copy' ]);

      expect(result2).toBe('Test copy 2');
    });
  });

  describe('edge cases', () => {
    it('should handle empty input label', () => {
      const result = generateNewLabel('', []);

      expect(result).toBe('Column Set');
    });

    it('should handle empty input label with labels', () => {
      const result = generateNewLabel('', [ 'Column Set', 'Column Set copy', 'Column Set copy 2' ]);

      expect(result).toBe('Column Set copy 3');
    });

    it('should handle labels with special characters', () => {
      const result = generateNewLabel('Special @#$%', [ 'Special @#$%' ]);

      expect(result).toBe('Special @#$% copy');
    });

    it('should handle very long labels', () => {
      const longLabel = 'A'.repeat(100);
      const result = generateNewLabel(longLabel, [ longLabel ]);

      expect(result).toBe(`${ longLabel } copy`);
    });
  });
});
