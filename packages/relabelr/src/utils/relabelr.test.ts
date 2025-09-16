import { describe, it, expect } from 'vitest';
import { relabelr, incrementFileName, COPY_FORMATS } from './relabelr';

describe('incrementFileName', () => {
  describe('default format', () => {
    it('should handle basic increments', () => {
      expect(incrementFileName('test')).toBe('test copy');
      expect(incrementFileName('test copy')).toBe('test copy 2');
      expect(incrementFileName('test copy 2')).toBe('test copy 3');
    });

    it('should handle files with extensions', () => {
      expect(incrementFileName('test.txt')).toBe('test copy.txt');
      expect(incrementFileName('test copy.txt')).toBe('test copy 2.txt');
      expect(incrementFileName('test copy 5.txt')).toBe('test copy 6.txt');
    });
  });

  describe('custom copy formats', () => {
    it('should work with CAPITALIZED format', () => {
      const format = COPY_FORMATS.CAPITALIZED;
      expect(incrementFileName('test', format)).toBe('test Copy');
      expect(incrementFileName('test Copy', format)).toBe('test Copy 2');
      expect(incrementFileName('test Copy 2', format)).toBe('test Copy 3');
    });

    it('should work with START_WITH_ONE format', () => {
      const format = COPY_FORMATS.START_WITH_ONE;
      expect(incrementFileName('test', format)).toBe('test copy 1');
      expect(incrementFileName('test copy 1', format)).toBe('test copy 2');
      expect(incrementFileName('test copy 5', format)).toBe('test copy 6');
    });

    it('should work with PARENTHESES format', () => {
      const format = COPY_FORMATS.PARENTHESES;
      expect(incrementFileName('test', format)).toBe('test Copy (1)');
      expect(incrementFileName('test Copy (1)', format)).toBe('test Copy (2)');
      expect(incrementFileName('test Copy (10)', format)).toBe('test Copy (11)');
    });

    it('should work with NUMBERS_ONLY format', () => {
      const format = COPY_FORMATS.NUMBERS_ONLY;
      expect(incrementFileName('test', format)).toBe('test (1)');
      expect(incrementFileName('test (1)', format)).toBe('test (2)');
      expect(incrementFileName('test (99)', format)).toBe('test (100)');
    });

    it('should handle custom format', () => {
      const customFormat = {
        copyWord: 'duplicate',
        firstCopyFormat: '{copyWord}',
        numberedCopyFormat: '{copyWord}-{number}',
      };
      expect(incrementFileName('test', customFormat)).toBe('test duplicate');
      expect(incrementFileName('test duplicate', customFormat)).toBe('test duplicate-2');
      expect(incrementFileName('test duplicate-5', customFormat)).toBe('test duplicate-6');
    });
  });
});

describe('relabelr', () => {
  // Reset module state before each test

  describe('basic functionality', () => {
    it('should use the provided label if it does not exist', () => {
      const result = relabelr('My Columns', [ 'My Columns copy' ]);

      expect(result).toBe('My Columns');
    });

    it('should generate a label with "copy 2" when "copy 1" already exists', () => {
      const labels = [ 'My Columns', 'My Columns copy' ];
      const result = relabelr('My Columns', labels);

      expect(result).toBe('My Columns copy 2');
    });

    it('should find the lowest available number when there are gaps', () => {
      const labels = [ 'My Columns', 'My Columns copy', 'My Columns copy 3', 'My Columns copy 4' ];
      const result = relabelr('My Columns', labels);

      expect(result).toBe('My Columns copy 2');
    });
  });

  describe('handling labels with "Copy" already in them', () => {
    it('should extract the base label from a label with "Copy" in it', () => {
      const labels: string[] = [];
      const result = relabelr('My Columns copy 3', labels);

      expect(result).toBe('My Columns copy 3');
    });

    it('should handle multiple levels of copying correctly', () => {
      const labels = [ 'My Columns', 'My Columns copy' ];
      const result = relabelr('My Columns copy', labels);

      expect(result).toBe('My Columns copy 2');
    });

    it('should respect the base label when determining the next counter', () => {
      const labels = [
        'First Columns',
        'First Columns copy',
        'First Columns copy 2',
        'Second Columns copy 1',
      ];
      const result = relabelr('First Columns', labels);

      expect(result).toBe('First Columns copy 3');
    });
  });

  describe('handling multiple calls for the same label', () => {
    it('should increment the counter for consecutive copies of the same label', () => {
      const labels: string[] = [];

      // First call
      const result1 = relabelr('Test Label', labels);

      expect(result1).toBe('Test Label');

      // Add the result to labels
      labels.push(result1);

      // Second call
      const result2 = relabelr('Test Label', labels);

      expect(result2).toBe('Test Label copy');

      // Add the result to labels
      labels.push(result2);

      // Third call
      const result3 = relabelr('Test Label', labels);

      expect(result3).toBe('Test Label copy 2');
    });

    it('should use module-level existingCounters to track used numbers', () => {
      const result1 = relabelr('Test', [ 'Test' ]);

      expect(result1).toBe('Test copy');

      const result2 = relabelr('Test', [ 'Test', 'Test copy' ]);

      expect(result2).toBe('Test copy 2');
    });
  });

  describe('edge cases', () => {
    it('should handle empty input label', () => {
      const result = relabelr('', []);

      expect(result).toBe('Unnamed');
    });

    it('should handle empty input label with labels', () => {
      const result = relabelr('', [ 'Unnamed', 'Unnamed copy', 'Unnamed copy 2' ]);

      expect(result).toBe('Unnamed copy 3');
    });

    it('should handle labels with special characters', () => {
      const result = relabelr('Special @#$%', [ 'Special @#$%' ]);

      expect(result).toBe('Special @#$% copy');
    });

    it('should handle very long labels', () => {
      const longLabel = 'A'.repeat(100);
      const result = relabelr(longLabel, [ longLabel ]);

      expect(result).toBe(`${ longLabel } copy`);
    });
  });

  describe('custom copy formats', () => {
    it('should work with CAPITALIZED format', () => {
      const format = COPY_FORMATS.CAPITALIZED;
      const result1 = relabelr('Test', ['Test'], format);
      expect(result1).toBe('Test Copy');

      const result2 = relabelr('Test', ['Test', 'Test Copy'], format);
      expect(result2).toBe('Test Copy 2');
    });

    it('should work with PARENTHESES format', () => {
      const format = COPY_FORMATS.PARENTHESES;
      const result1 = relabelr('Test', ['Test'], format);
      expect(result1).toBe('Test Copy (1)');

      const result2 = relabelr('Test', ['Test', 'Test Copy (1)'], format);
      expect(result2).toBe('Test Copy (2)');

      const result3 = relabelr('Test', ['Test', 'Test Copy (1)', 'Test Copy (2)'], format);
      expect(result3).toBe('Test Copy (3)');
    });

    it('should work with NUMBERS_ONLY format', () => {
      const format = COPY_FORMATS.NUMBERS_ONLY;
      const result1 = relabelr('Test', ['Test'], format);
      expect(result1).toBe('Test (1)');

      const result2 = relabelr('Test', ['Test', 'Test (1)'], format);
      expect(result2).toBe('Test (2)');
    });

    it('should work with START_WITH_ONE format', () => {
      const format = COPY_FORMATS.START_WITH_ONE;
      const result1 = relabelr('Test', ['Test'], format);
      expect(result1).toBe('Test copy 1');

      const result2 = relabelr('Test', ['Test', 'Test copy 1'], format);
      expect(result2).toBe('Test copy 2');
    });
  });
});
