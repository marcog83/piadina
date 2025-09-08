import { describe, it, expect } from 'vitest';
import type { TestV1, TestV2, TestV3 } from '../__mocks__/test.types';
import {
  ERR_UNSUPPORTED_VERSION,
  FlowError,
  ERR_MISSING_VERSION,
  ERR_NODES_NOT_REGISTERED,
  ERR_UNKNOWN,
} from './error-codes';
import { MigrationChain } from './migration-chain';
import { VersionFlow } from './version-flow';
import { assertTestV1, assertTestV2, assertTestV3 } from '../__mocks__/check-validators';

describe('VersionFlow', () => {
  describe('add', () => {
    it('should add a migration node to the builder', () => {
      const builder = new VersionFlow<TestV3>();

      const result = builder.add<TestV1, TestV2>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(assertTestV1)
          .migrate((v1) => ({
            version: '2.0.0',
            data: {
              fullName: v1.data.name,
              birthYear: new Date().getFullYear() - v1.data.age,
            },
          }));
      });

      expect(result).toBe(builder);
    });

    it('should allow chaining multiple add calls', () => {
      const builder = new VersionFlow<TestV3>();

      const result = builder
        .add<TestV1, TestV2>(() => { })
        .add<TestV2>(() => { })
        .add<TestV3>(() => { });

      expect(result).toBe(builder);
    });

    it('should handle empty callback without throwing', () => {
      const builder = new VersionFlow<TestV1>();

      expect(() => {
        builder.add<TestV1>(() => { });
      }).not.toThrow();
    });
  });

  describe('build', () => {
    it('should create a MigrationChain from added nodes', () => {
      const builder = new VersionFlow<TestV2>();

      builder.add<TestV1>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(assertTestV1);
      });

      const chain = builder.build();

      expect(chain).toBeInstanceOf(MigrationChain);
    });

    it('should create MigrationChain with multiple nodes', () => {
      const builder = new VersionFlow<TestV3>();

      builder
        .add<TestV1, TestV2>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(assertTestV1)
          .migrate((v1) => ({
            version: '2.0.0',
            data: {
              fullName: v1.data.name,
              birthYear: new Date().getFullYear() - v1.data.age,
            },
          }));
      })
        .add<TestV2, TestV3>((nodeBuilder) => {
        nodeBuilder
          .version('2.0.0')
          .semverRange('^2.0.0')
          .assert(assertTestV2)
          .migrate((v2) => {
            const age = new Date().getFullYear() - v2.data.birthYear;

            return {
              version: '3.0.0',
              data: {
                name: v2.data.fullName,
                age,
                isAdult: age >= 18,
              },
            };
          });
      }).add<TestV3>((nodeBuilder) => {
        nodeBuilder
          .version('3.0.0')
          .semverRange('^3.0.0')
          .assert(assertTestV3);
      });

      const chain = builder.build();

      expect(chain).toBeInstanceOf(MigrationChain);
    });

    it('should create empty MigrationChain when no nodes added', () => {
      const builder = new VersionFlow<unknown>();

      const chain = builder.build();

      expect(chain).toBeInstanceOf(MigrationChain);
    });

    it('should sort migration nodes by version when building', () => {
      const builder = new VersionFlow<TestV3>();

      // Add nodes in reverse order to test sorting
      builder
        .add<TestV3>((nodeBuilder) => {
        nodeBuilder
          .version('3.0.0')
          .semverRange('^3.0.0')
          .assert(assertTestV3);
      })
        .add<TestV1, TestV2>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(assertTestV1)
          .migrate((v1) => ({
            version: '2.0.0',
            data: {
              fullName: v1.data.name,
              birthYear: new Date().getFullYear() - v1.data.age,
            },
          }));
      })
        .add<TestV2, TestV3>((nodeBuilder) => {
        nodeBuilder
          .version('2.0.0')
          .semverRange('^2.0.0')
          .assert(assertTestV2)
          .migrate((v2) => ({
            version: '3.0.0',
            data: {
              name: v2.data.fullName,
              age: new Date().getFullYear() - v2.data.birthYear,
              isAdult: (new Date().getFullYear() - v2.data.birthYear) >= 18,
            },
          }));
      });

      const chain = builder.build();

      expect(chain).toBeInstanceOf(MigrationChain);

      // Test that the chain works correctly with a V1 input (which means nodes are sorted properly)
      const input: TestV1 = {
        version: '1.0.0',
        data: {
          name: 'John Doe',
          age: 25,
        },
      };

      const [ isSuccess, result ] = chain.upgradeToLatest(input);

      expect(isSuccess).toBe(true);
      expect(result).toEqual({
        version: '3.0.0',
        data: {
          name: 'John Doe',
          age: 25,
          isAdult: true,
        },
      });
    });
  });

  describe('execute', () => {
    it('should execute migration chain and return final data', () => {
      const builder = new VersionFlow<TestV3>();

      builder
        .add<TestV1, TestV2>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(assertTestV1)
          .migrate((v1) => ({
            version: '2.0.0',
            data: {
              fullName: v1.data.name,
              birthYear: new Date().getFullYear() - v1.data.age,
            },
          }));
      })
        .add<TestV2, TestV3>((nodeBuilder) => {
        nodeBuilder
          .version('2.0.0')
          .semverRange('^2.0.0')
          .assert(assertTestV2)
          .migrate((v2) => {
            const age = new Date().getFullYear() - v2.data.birthYear;

            return {
              version: '3.0.0',
              data: {
                name: v2.data.fullName,
                age,
                isAdult: age >= 18,
              },
            };
          });
      }).add<TestV3, TestV3>((nodeBuilder) => {
        nodeBuilder
          .version('3.0.0')
          .semverRange('^3.0.0')
          .assert(assertTestV3);
      });

      const input: TestV1 = {
        version: '1.0.0',
        data: {
          name: 'John Doe',
          age: 25,
        },
      };

      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(true);
      expect(result).toEqual({
        version: '3.0.0',
        data: {
          name: 'John Doe',
          age: 25,
          isAdult: true,
        },
      });
    });

    it('should handle single migration step', () => {
      const builder = new VersionFlow<TestV2>();

      builder.add<TestV1, TestV2>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(assertTestV1)
          .migrate((v1) => ({
            version: '2.0.0',
            data: {
              fullName: v1.data.name,
              birthYear: new Date().getFullYear() - v1.data.age,
            },
          }));
      }).add<TestV2>((nodeBuilder) => {
        nodeBuilder
          .version('2.0.0')
          .semverRange('^2.0.0')
          .assert(assertTestV2);
      });

      const input = {
        version: '1.0.0',
        data: {
          name: 'Jane Smith',
          age: 30,
        },
      };

      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(true);
      expect(result).toEqual({
        version: '2.0.0',
        data: {
          fullName: 'Jane Smith',
          birthYear: new Date().getFullYear() - 30,
        },
      });
    });

    it('should throw error for unsupported version', () => {
      const builder = new VersionFlow<TestV1>();

      builder.add<TestV1>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(assertTestV1);
      });

      const input = {
        version: '3.0.0',
        data: {
          name: 'Unknown Version',
          age: 25,
          isAdult: true,
        },
      };
      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(false);
      expect(result).toBeInstanceOf(FlowError);
      expect((result as FlowError).message).toBe('Unsupported input version.');
      expect((result as FlowError).cause).toEqual({
        code: ERR_UNSUPPORTED_VERSION,
        data: { version: '3.0.0' },
      });
    });

    it('should throw error for input with invalid version type', () => {
      const builder = new VersionFlow<TestV2>();

      builder.add<TestV1, TestV2>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(assertTestV1)
          .migrate((v1) => ({
            version: '2.0.0',
            data: {
              fullName: v1.data.name,
              birthYear: new Date().getFullYear() - v1.data.age,
            },
          }));
      });

      const input = {
        version: 123,
        data: {
          name: 'Invalid Version Type',
          age: 25,
        },
      } as const;
      //@ts-expect-error - version cannot be number
      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(false);
      expect(result).toBeInstanceOf(FlowError);
      expect((result as FlowError).message).toBe('Missing or invalid version in input object.');
      expect((result as FlowError).cause).toEqual({
        code: ERR_MISSING_VERSION,
        data: { version: 123 },
      });
    });

    it('should throw error when no migration nodes are available', () => {
      const builder = new VersionFlow<TestV1>();

      const input = {
        version: '1.0.0',
        data: {
          name: 'Test',
          age: 25,
        },
      };

      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(false);
      expect(result).toBeInstanceOf(FlowError);
      expect((result as FlowError).message).toBe('No nodes are registered in the VersionFlow.');
      expect((result as FlowError).cause).toEqual({
        code: ERR_NODES_NOT_REGISTERED,
      });
    });

    it('should throw error when version is missing', () => {
      const builder = new VersionFlow<TestV1>();

      builder.add<TestV1>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(assertTestV1);
      });

      const input = {
        data: {
          name: 'Test',
          age: 25,
        },
      } as const;
      //@ts-expect-error - version cannot be undefined
      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(false);
      expect(result).toBeInstanceOf(FlowError);
      expect((result as FlowError).message).toBe('Missing or invalid version in input object.');
      expect((result as FlowError).cause).toEqual({
        code: ERR_MISSING_VERSION,
        data: { version: undefined },
      });
    });

    it('should throw error when version is null', () => {
      const builder = new VersionFlow<TestV1>();

      builder.add<TestV1>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(assertTestV1);
      });

      const input = {
        version: null,
        data: {
          name: 'Test',
          age: 25,
        },
      } as const;
      //@ts-expect-error - version cannot be null
      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(false);
      expect(result).toBeInstanceOf(FlowError);
      expect((result as FlowError).message).toBe('Missing or invalid version in input object.');
      expect((result as FlowError).cause).toEqual({
        code: ERR_MISSING_VERSION,
        data: { version: null },
      });
    });

    it('should handle non-Error objects thrown during migration', () => {
      const builder = new VersionFlow<TestV1>();

      builder.add<TestV1>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(() => {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw 'This is a string error, not an Error object';
          });
      });

      const input = {
        version: '1.0.0',
        data: {
          name: 'Test',
          age: 25,
        },
      };

      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(false);
      expect(result).toBeInstanceOf(FlowError);
      expect((result as FlowError).message).toBe('Unknown error during validation.');
      expect((result as FlowError).cause).toEqual({
        code: ERR_UNKNOWN,
        data: 'This is a string error, not an Error object',
      });
    });

    it('should handle objects thrown during migration', () => {
      const builder = new VersionFlow<TestV1>();

      builder.add<TestV1>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(() => {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw { message: 'Custom error object', code: 'CUSTOM_ERROR' };
          });
      });

      const input = {
        version: '1.0.0',
        data: {
          name: 'Test',
          age: 25,
        },
      };

      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(false);
      expect(result).toBeInstanceOf(FlowError);
      expect((result as FlowError).message).toBe('Unknown error during validation.');
      expect((result as FlowError).cause).toEqual({
        code: ERR_UNKNOWN,
        data: { message: 'Custom error object', code: 'CUSTOM_ERROR' },
      });
    });

    it('should handle numbers thrown during migration', () => {
      const builder = new VersionFlow<TestV1>();

      builder.add<TestV1>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(() => {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw 42;
          });
      });

      const input = {
        version: '1.0.0',
        data: {
          name: 'Test',
          age: 25,
        },
      };

      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(false);
      expect(result).toBeInstanceOf(FlowError);
      expect((result as FlowError).message).toBe('Unknown error during validation.');
      expect((result as FlowError).cause).toEqual({
        code: ERR_UNKNOWN,
        data: 42,
      });
    });
  });

  describe('integration scenarios', () => {
    it('should work with same input and output types', () => {
      interface SameTypeData {
        value: number;
      }

      interface SameType { version: '1.0.0'; data: SameTypeData }

      const builder = new VersionFlow<SameTypeData>();

      builder.add<SameType, SameType>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert((input) => input)
          .migrate((input) => ({
            ...input,
            data: {
              value: input.data.value * 2,
            },
          }));
      });

      const input: SameType = {
        version: '1.0.0',
        data: {
          value: 5,
        },
      };

      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(true);
      expect(result).toEqual({
        version: '1.0.0',
        data: {
          value: 10,
        },
      });
    });
  });
  describe('catch', () => {
    it('should set catch callback and return builder instance', () => {
      const builder = new VersionFlow<TestV1>();
      const catchCallback = () => {};

      const result = builder.catch(catchCallback);

      expect(result).toBe(builder);
    });

    it('should call catch callback when execute throws an error', () => {
      const builder = new VersionFlow<TestV2>();
      let caughtError: unknown = null;

      builder
        .catch((error) => {
          caughtError = error;
        })
        .add<TestV1, TestV2>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(assertTestV1)
          .migrate(() => {
            throw new Error('Migration failed');
          });
      });

      const input: TestV1 = {
        version: '1.0.0',
        data: {
          name: 'John Doe',
          age: 25,
        },
      };

      // execute should not throw, but should call catch callback
      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(false);
      expect(caughtError).toBeInstanceOf(FlowError);
      expect((caughtError as FlowError).message).toBe('Unknown error during validation.');
      expect(result).toBeInstanceOf(FlowError);
      expect((result as FlowError).message).toBe('Unknown error during validation.');
      expect((result as FlowError).cause).toEqual({
        code: ERR_UNKNOWN,
        data: 'Migration failed',
      });
    });

    it('should call catch callback when assertion fails', () => {
      const builder = new VersionFlow<TestV2>();
      let caughtError: unknown = null;

      builder
        .catch((error) => {
          caughtError = error;
        })
        .add<TestV1, TestV2>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(() => {
            throw new Error('Assertion failed');
          })
          .migrate((v1) => ({
            version: '2.0.0',
            data: {
              fullName: v1.data.name,
              birthYear: new Date().getFullYear() - v1.data.age,
            },
          }));
      });

      const input: TestV1 = {
        version: '1.0.0',
        data: {
          name: 'John Doe',
          age: 25,
        },
      };

      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(false);
      expect(result).toBeInstanceOf(FlowError);
      expect((result as FlowError).message).toBe('Unknown error during validation.');
      expect((result as FlowError).cause).toEqual({
        code: ERR_UNKNOWN,
        data: 'Assertion failed',
      });

      expect(caughtError).toBeInstanceOf(FlowError);
      expect((caughtError as FlowError).message).toBe('Unknown error during validation.');
    });

    it('should call catch callback for unsupported version errors', () => {
      const builder = new VersionFlow<TestV1>();
      let caughtError: unknown = null;

      builder
        .catch((error) => {
          caughtError = error;
        })
        .add<TestV1>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(assertTestV1);
      });

      const input = {
        version: '3.0.0',
        data: {
          name: 'Unknown Version',
          age: 25,
        },
      };

      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(false);

      expect(result).toBeInstanceOf(FlowError);
      expect(caughtError).toBeInstanceOf(FlowError);

      expect((result as FlowError).message).toBe('Unsupported input version.');
      expect((caughtError as FlowError).message).toBe('Unsupported input version.');
      expect((result as FlowError).cause).toEqual({
        code: ERR_UNSUPPORTED_VERSION,
        data: { version: '3.0.0' },
      });
      expect((caughtError as FlowError).cause).toEqual({
        code: ERR_UNSUPPORTED_VERSION,
        data: { version: '3.0.0' },
      });
    });

    it('should call catch callback for invalid version type errors', () => {
      const builder = new VersionFlow<TestV1>();
      let caughtError: unknown = null;

      builder
        .catch((error) => {
          caughtError = error;
        })
        .add<TestV1>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(assertTestV1);
      });

      const input = {
        version: 123, // Invalid version type
        data: {
          name: 'Invalid Version Type',
          age: 25,
        },
      } as const;
      
      //@ts-expect-error - version cannot be number
      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(false);
      expect(result).toBeInstanceOf(FlowError);
      expect((result as FlowError).message).toBe('Missing or invalid version in input object.');
      expect(caughtError).toBeInstanceOf(FlowError);
      expect((caughtError as FlowError).message).toBe('Missing or invalid version in input object.');
      expect((result as FlowError).cause).toEqual({
        code: ERR_MISSING_VERSION,
        data: { version: 123 },
      });
      expect((caughtError as FlowError).cause).toEqual({
        code: ERR_MISSING_VERSION,
        data: { version: 123 },
      });
    });

    it('should allow catch callback to return a value', () => {
      const builder = new VersionFlow<TestV1>();
      const fallbackValue: TestV1 = {
        version: '1.0.0',
        data: {
          name: 'Fallback',
          age: 0,
        },
      };

      builder
        .catch(() => fallbackValue)
        .add<TestV1>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(() => {
            throw new Error('Assertion failed');
          });
      });

      const input: TestV1 = {
        version: '1.0.0',
        data: {
          name: 'John Doe',
          age: 25,
        },
      };

      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(true);
      expect(result).toEqual(fallbackValue);
    });

    it('should handle catch callback that throws an error', () => {
      const builder = new VersionFlow<TestV1>();

      builder
        .catch(() => {
          throw new Error('Catch callback error');
        })
        .add<TestV1>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(() => {
            throw new Error('Original error');
          });
      });

      const input = {
        version: '1.0.0',
        data: {
          name: 'John Doe',
          age: 25,
        },
      };

      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(false);
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('Unknown error during validation.');
      expect((result as Error).cause).toEqual({
        code: ERR_UNKNOWN,
        data: 'Catch callback error',
      });
    });

    it('should handle catch callback that throws non-Error object', () => {
      const builder = new VersionFlow<TestV1>();

      builder
        .catch(() => {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw 'String error';
        })
        .add<TestV1>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(() => {
            throw new Error('Original error');
          });
      });

      const input = {
        version: '1.0.0',
        data: {
          name: 'John Doe',
          age: 25,
        },
      };

      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(false);
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('Unknown error during validation.');
      expect((result as Error).cause).toEqual({
        code: ERR_UNKNOWN,
        data: 'String error',
      });
    });

    it('should not call catch callback when execution succeeds', () => {
      const builder = new VersionFlow<TestV2>();
      let catchCallbackCalled = false;

      builder
        .catch(() => {
          catchCallbackCalled = true;
        })
        .add<TestV1, TestV2>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(assertTestV1)
          .migrate((v1) => ({
            version: '2.0.0',
            data: {
              fullName: v1.data.name,
              birthYear: new Date().getFullYear() - v1.data.age,
            },
          }));
      })
        .add<TestV2>((nodeBuilder) => {
        nodeBuilder
          .version('2.0.0')
          .semverRange('^2.0.0')
          .assert(assertTestV2);
      });

      const input: TestV1 = {
        version: '1.0.0',
        data: {
          name: 'John Doe',
          age: 25,
        },
      };

      const [ isSuccess, result ] = builder.execute(input);

      expect(isSuccess).toBe(true);
      expect(catchCallbackCalled).toBe(false);
      expect(result).toEqual({
        version: '2.0.0',
        data: {
          fullName: 'John Doe',
          birthYear: new Date().getFullYear() - 25,
        },
      });
    });

    it('should allow overriding catch callback', () => {
      const builder = new VersionFlow<TestV1>();
      let firstCallbackCalled = false;
      let secondCallbackCalled = false;
      const fallbackValue: TestV1 = {
        version: '1.0.0',
        data: {
          name: 'John Doe',
          age: 25,
        },
      };

      builder
        .catch(() => {
          firstCallbackCalled = true;
        })
        .catch(() => {
          secondCallbackCalled = true;

          return fallbackValue;
        })
        .add<TestV1>((nodeBuilder) => {
        nodeBuilder
          .version('1.0.0')
          .semverRange('^1.0.0')
          .assert(() => {
            throw new Error('Test error');
          });
      });

      const input: TestV1 = {
        version: '1.0.0',
        data: {
          name: 'John Doe',
          age: 25,
        },
      };

      const [ isSuccess, result ] = builder.execute(input);

      expect(firstCallbackCalled).toBe(false);
      expect(secondCallbackCalled).toBe(true);
      expect(isSuccess).toBe(true);
      expect(result).toEqual(fallbackValue);
    });
  });
});
