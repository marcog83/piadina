import { describe, expect, it } from 'vitest';
import { ERR_NO_ASSERT_FUNCTION } from './error-codes';
import { NodeBuilder } from './node-builder';
import { assertTestV1 } from '../__mocks__/check-validators';

// Test types for demonstration
interface TestV1 {
  version: string;
  data: {
    name: string;
    age: number;
  };
}

interface TestV2 {
  version: string;
  data: {
    fullName: string;
    birthYear: number;
  };
}

describe('NodeBuilder', () => {
  describe('version', () => {
    it('should set version and return builder instance', () => {
      const builder = new NodeBuilder<TestV1>();

      const result = builder.version('1.0.0');

      expect(result).toBe(builder);
    });

    it('should allow method chaining with version', () => {
      const builder = new NodeBuilder<TestV1>();

      const result = builder
        .version('1.0.0')
        .semverRange('^1.0.0')
        .assert(assertTestV1);

      expect(result).toBe(builder);
    });
  });

  describe('semverRange', () => {
    it('should set semver range and return builder instance', () => {
      const builder = new NodeBuilder<TestV1>();

      const result = builder.semverRange('^1.0.0');

      expect(result).toBe(builder);
    });

    it('should work with different semver range patterns', () => {
      const builder = new NodeBuilder<TestV1>();

      expect(() => {
        builder
          .semverRange('~1.0.0')
          .version('1.0.0')
          .assert(assertTestV1)
          .build();
      }).not.toThrow();
    });
  });

  describe('migrate', () => {
    it('should set migrate function and return builder instance', () => {
      const builder = new NodeBuilder<TestV1, TestV2>();

      const migrateFunction = (input: TestV1): TestV2 => ({
        version: '2.0.0',
        data: {
          fullName: input.data.name,
          birthYear: new Date().getFullYear() - input.data.age,
        },
      });

      const result = builder.migrate(migrateFunction);

      expect(result).toBe(builder);
    });

    it('should allow building node without migrate function', () => {
      const builder = new NodeBuilder<TestV1>();

      const node = builder
        .version('1.0.0')
        .semverRange('^1.0.0')
        .assert(assertTestV1)
        .build();

      expect(node.migrate).toBeUndefined();
    });
  });

  describe('assert', () => {
    it('should set assert function and return builder instance', () => {
      const builder = new NodeBuilder<TestV1>();

      const result = builder.assert(assertTestV1);

      expect(result).toBe(builder);
    });

    it('should work with custom assert function', () => {
      const builder = new NodeBuilder<TestV1>();

      const customAssert = (input: unknown): void => {
        if (!input) {
          throw new Error('Input is required');
        }
      };

      const node = builder
        .version('1.0.0')
        .semverRange('^1.0.0')
        .assert(customAssert)
        .build();

      expect(node.assert).toBe(customAssert);
    });
  });

  describe('build', () => {
    it('should build migration node with all properties', () => {
      const builder = new NodeBuilder<TestV1, TestV2>();

      const migrateFunction = (input: TestV1): TestV2 => ({
        version: '2.0.0',
        data: {
          fullName: input.data.name,
          birthYear: new Date().getFullYear() - input.data.age,
        },
      });

      const node = builder
        .version('1.0.0')
        .semverRange('^1.0.0')
        .assert(assertTestV1)
        .migrate(migrateFunction)
        .build();

      expect(node.version).toBe('1.0.0');
      expect(node.semverRange).toBe('^1.0.0');
      expect(node.assert).toBe(assertTestV1);
      expect(node.migrate).toBe(migrateFunction);
    });

    it('should build migration node without migrate function', () => {
      const builder = new NodeBuilder<TestV1>();

      const node = builder
        .version('1.0.0')
        .semverRange('^1.0.0')
        .assert(assertTestV1)
        .build();

      expect(node.version).toBe('1.0.0');
      expect(node.semverRange).toBe('^1.0.0');
      expect(node.assert).toBe(assertTestV1);
      expect(node.migrate).toBeUndefined();
    });

    it('should use default values when not explicitly set', () => {
      const builder = new NodeBuilder<TestV1>();

      const node = builder
        .assert(assertTestV1)
        .build();

      expect(node.version).toBe('1.0.0');
      expect(node.semverRange).toBe('~1.0.0');
      expect(node.assert).toBe(assertTestV1);
      expect(node.migrate).toBeUndefined();
    });

    it('should throw error when assert function is not provided', () => {
      const builder = new NodeBuilder<TestV1>();

      builder
        .version('1.0.0')
        .semverRange('^1.0.0');

      expect(() => builder.build()).toThrow('No assert function provided for validation node.');

      try {
        builder.build();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).cause).toEqual({
          code: ERR_NO_ASSERT_FUNCTION,
          data: { version: '1.0.0' },
        });
      }
    });

    it('should throw error with version data when assert function is missing', () => {
      const builder = new NodeBuilder<TestV1>();

      builder
        .version('2.5.0')
        .semverRange('^2.0.0');

      expect(() => builder.build()).toThrow('No assert function provided for validation node.');

      try {
        builder.build();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).cause).toEqual({
          code: ERR_NO_ASSERT_FUNCTION,
          data: { version: '2.5.0' },
        });
      }
    });

    it('should throw error even when migrate function is provided but assert is missing', () => {
      const builder = new NodeBuilder<TestV1, TestV2>();

      const migrateFunction = (input: TestV1): TestV2 => ({
        version: '2.0.0',
        data: {
          fullName: input.data.name,
          birthYear: new Date().getFullYear() - input.data.age,
        },
      });

      builder
        .version('1.0.0')
        .semverRange('^1.0.0')
        .migrate(migrateFunction);

      expect(() => builder.build()).toThrow('No assert function provided for validation node.');

      try {
        builder.build();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).cause).toEqual({
          code: ERR_NO_ASSERT_FUNCTION,
          data: { version: '1.0.0' },
        });
      }
    });
  });

  describe('method chaining', () => {
    it('should support full method chaining', () => {
      const builder = new NodeBuilder<TestV1, TestV2>();

      const migrateFunction = (input: TestV1): TestV2 => ({
        version: '2.0.0',
        data: {
          fullName: input.data.name,
          birthYear: new Date().getFullYear() - input.data.age,
        },
      });

      const node = builder
        .version('1.0.0')
        .semverRange('^1.0.0')
        .assert(assertTestV1)
        .migrate(migrateFunction)
        .build();

      expect(node).toBeDefined();
      expect(node.version).toBe('1.0.0');
      expect(node.semverRange).toBe('^1.0.0');
      expect(node.assert).toBe(assertTestV1);
      expect(node.migrate).toBe(migrateFunction);
    });

    it('should support partial method chaining', () => {
      const builder = new NodeBuilder<TestV1>();

      builder.version('1.0.0');
      builder.semverRange('^1.0.0');
      builder.assert(assertTestV1);

      const node = builder.build();

      expect(node).toBeDefined();
      expect(node.version).toBe('1.0.0');
      expect(node.semverRange).toBe('^1.0.0');
      expect(node.assert).toBe(assertTestV1);
      expect(node.migrate).toBeUndefined();
    });
  });
});
