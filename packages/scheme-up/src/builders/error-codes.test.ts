import { describe, expect, it } from 'vitest';
import {
  ERR_NODES_NOT_REGISTERED,
  ERR_UNSUPPORTED_VERSION,
  ERR_MISSING_VERSION,
  ERR_NO_MIGRATION_NODE_FOUND,
  ERR_UNKNOWN,
  ERR_NO_ASSERT_FUNCTION,
  ERROR_MESSAGES,
  FlowError,
} from './error-codes';

describe('Error Codes', () => {
  describe('Error Code Constants', () => {
    it('should have correct error code values', () => {
      expect(ERR_NODES_NOT_REGISTERED).toBe('FLOW-0001');
      expect(ERR_UNSUPPORTED_VERSION).toBe('FLOW-0002');
      expect(ERR_MISSING_VERSION).toBe('FLOW-0003');
      expect(ERR_NO_MIGRATION_NODE_FOUND).toBe('FLOW-0004');
      expect(ERR_UNKNOWN).toBe('FLOW-0005');
      expect(ERR_NO_ASSERT_FUNCTION).toBe('FLOW-0006');
    });
  });

  describe('FlowError', () => {
    describe('constructor', () => {
      it('should create FlowError with error code and message', () => {
        const error = new FlowError(ERR_NO_ASSERT_FUNCTION);

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(FlowError);
        expect(error.message).toBe(ERROR_MESSAGES[ERR_NO_ASSERT_FUNCTION]);
        expect(error.cause).toEqual({
          code: ERR_NO_ASSERT_FUNCTION,
        });
      });

      it('should create FlowError with error code and data', () => {
        const testData = { version: '1.0.0' };
        const error = new FlowError(ERR_NO_ASSERT_FUNCTION, testData);

        expect(error.message).toBe(ERROR_MESSAGES[ERR_NO_ASSERT_FUNCTION]);
        expect(error.cause).toEqual({
          code: ERR_NO_ASSERT_FUNCTION,
          data: testData,
        });
      });

      it.each([
        [ ERR_NODES_NOT_REGISTERED ],
        [ ERR_UNSUPPORTED_VERSION ],
        [ ERR_MISSING_VERSION ],
        [ ERR_NO_MIGRATION_NODE_FOUND ],
      ])('should create FlowError for all error codes', (code) => {
        const error = new FlowError(code);

        expect(error.message).toBe(ERROR_MESSAGES[code]);
        expect(error.cause).toEqual({
          code,
        });
      });

      it('should create FlowError with complex data object', () => {
        const complexData = {
          version: '2.1.0',
          input: { name: 'test', age: 25 },
          metadata: { timestamp: Date.now(), source: 'test' },
        };

        const error = new FlowError(ERR_UNSUPPORTED_VERSION, complexData);

        expect(error.message).toBe(ERROR_MESSAGES[ERR_UNSUPPORTED_VERSION]);
        expect(error.cause).toEqual({
          code: ERR_UNSUPPORTED_VERSION,
          data: complexData,
        });
      });

      it('should create FlowError with empty data object', () => {
        const error = new FlowError(ERR_MISSING_VERSION, {});

        expect(error.message).toBe(ERROR_MESSAGES[ERR_MISSING_VERSION]);
        expect(error.cause).toEqual({
          code: ERR_MISSING_VERSION,
          data: {},
        });
      });
    });

    describe('from static method', () => {
      it('should return same FlowError instance when passed FlowError', () => {
        const originalError = new FlowError(ERR_NO_ASSERT_FUNCTION, { version: '1.0.0' });
        const result = FlowError.from(originalError);

        expect(result).toBe(originalError);
        expect(result.message).toBe(ERROR_MESSAGES[ERR_NO_ASSERT_FUNCTION]);
        expect(result.cause).toEqual({
          code: ERR_NO_ASSERT_FUNCTION,
          data: { version: '1.0.0' },
        });
      });

      it('should convert Error with cause to FlowError', () => {
        const originalError = new Error('Custom error message');

        originalError.cause = {
          code: ERR_UNSUPPORTED_VERSION,
          data: { version: '3.0.0' },
        };

        const result = FlowError.from(originalError);

        expect(result).toBeInstanceOf(FlowError);
        expect(result).not.toBe(originalError);
        expect(result.message).toBe(ERROR_MESSAGES[ERR_UNSUPPORTED_VERSION]);
        expect(result.cause).toEqual(originalError.cause);
      });

      it('should convert Error without cause to FlowError with UNKNOWN error', () => {
        const originalError = new Error('Some unexpected error');
        const result = FlowError.from(originalError);

        expect(result).toBeInstanceOf(FlowError);
        expect(result).not.toBe(originalError);
        expect(result.message).toBe(ERROR_MESSAGES[ERR_UNKNOWN]);
        expect(result.cause).toEqual({
          code: ERR_UNKNOWN,
          data: 'Some unexpected error',
        });
      });

      it('should convert Error with invalid cause to FlowError with UNKNOWN error', () => {
        const originalError = new Error('Error with invalid cause');

        originalError.cause = { invalidProperty: 'test' };

        const result = FlowError.from(originalError);

        expect(result).toBeInstanceOf(FlowError);
        expect(result.message).toBe(ERROR_MESSAGES[ERR_UNKNOWN]);
        expect(result.cause).toEqual({
          code: ERR_UNKNOWN,
          data: 'Error with invalid cause',
        });
      });

      it('should convert Error with empty message to FlowError', () => {
        const originalError = new Error('');
        const result = FlowError.from(originalError);

        expect(result).toBeInstanceOf(FlowError);
        expect(result.message).toBe(ERROR_MESSAGES[ERR_UNKNOWN]);
        expect(result.cause).toEqual({
          code: ERR_UNKNOWN,
          data: '',
        });
      });

      it('should convert string to FlowError', () => {
        const errorString = 'This is a string error';
        const result = FlowError.from(errorString);

        expect(result).toBeInstanceOf(FlowError);
        expect(result.message).toBe(ERROR_MESSAGES[ERR_UNKNOWN]);
        expect(result.cause).toEqual({
          code: ERR_UNKNOWN,
          data: errorString,
        });
      });

      it('should not convert number to FlowError', () => {
        const errorNumber = 404;
        const result = FlowError.from(errorNumber);

        expect(result).toBeInstanceOf(FlowError);
        expect(result.message).toBe(ERROR_MESSAGES[ERR_UNKNOWN]);
        expect(result.cause).toEqual({
          code: ERR_UNKNOWN,
          data: errorNumber,
        });
      });

      it('should not convert object to FlowError', () => {
        const errorObject = { type: 'CustomError', details: 'Something went wrong' };
        const result = FlowError.from(errorObject);

        expect(result).toBeInstanceOf(FlowError);
        expect(result.message).toBe(ERROR_MESSAGES[ERR_UNKNOWN]);
        expect(result.cause).toEqual({
          code: ERR_UNKNOWN,
          data: errorObject,
        });
      });

      it('should not convert null to FlowError', () => {
        const result = FlowError.from(null);

        expect(result).toBeInstanceOf(FlowError);
        expect(result.message).toBe(ERROR_MESSAGES[ERR_UNKNOWN]);
        expect(result.cause).toEqual({
          code: ERR_UNKNOWN,
          data: null,
        });
      });

      it('should not convert undefined to FlowError', () => {
        const result = FlowError.from(undefined);

        expect(result).toBeInstanceOf(FlowError);
        expect(result.message).toBe(ERROR_MESSAGES[ERR_UNKNOWN]);
        expect(result.cause).toEqual({
          code: ERR_UNKNOWN,
          data: undefined,
        });
      });

      it('should not convert boolean to FlowError', () => {
        const result = FlowError.from(false);

        expect(result).toBeInstanceOf(FlowError);
        expect(result.message).toBe(ERROR_MESSAGES[ERR_UNKNOWN]);
        expect(result.cause).toEqual({
          code: ERR_UNKNOWN,
          data: false,
        });
      });

      it('should not convert array to FlowError', () => {
        const errorArray = [ 'error1', 'error2' ];
        const result = FlowError.from(errorArray);

        expect(result).toBeInstanceOf(FlowError);
        expect(result.message).toBe(ERROR_MESSAGES[ERR_UNKNOWN]);
        expect(result.cause).toEqual({
          code: ERR_UNKNOWN,
          data: errorArray,
        });
      });
    });

    describe('error inheritance', () => {
      it('should inherit from Error correctly', () => {
        const error = new FlowError(ERR_NO_ASSERT_FUNCTION);

        expect(error instanceof Error).toBe(true);
        expect(error instanceof FlowError).toBe(true);
        expect(error.name).toBe('FlowError');
        expect(typeof error.stack).toBe('string');
      });

      it('should be catchable as Error', () => {
        expect(() => {
          throw new FlowError(ERR_UNKNOWN);
        }).toThrow(Error);

        expect(() => {
          throw new FlowError(ERR_UNKNOWN);
        }).toThrow(FlowError);
      });

      it('should have proper error properties', () => {
        const error = new FlowError(ERR_UNSUPPORTED_VERSION, { version: '2.0.0' });

        expect(error.message).toBeTruthy();
        expect(error.cause).toBeTruthy();
        expect(error.stack).toBeTruthy();
      });
    });

    describe('integration scenarios', () => {
      it('should work in try-catch blocks', () => {
        let caughtError: FlowError | null = null;

        try {
          throw new FlowError(ERR_NO_MIGRATION_NODE_FOUND);
        } catch (error) {
          caughtError = error as FlowError;
        }

        expect(caughtError).toBeInstanceOf(FlowError);
        expect(caughtError?.message).toBe(ERROR_MESSAGES[ERR_NO_MIGRATION_NODE_FOUND]);
      });

      it('should preserve cause information through conversions', () => {
        const originalData = { version: '1.5.0', input: { test: true } };
        const error1 = new FlowError(ERR_MISSING_VERSION, originalData);
        const error2 = FlowError.from(error1);

        expect(error2).toBe(error1); // Same instance
        expect(error2.cause).toEqual({
          code: ERR_MISSING_VERSION,
          data: originalData,
        });
      });

      it('should handle nested error conversions', () => {
        const innerError = new Error('Inner error');

        innerError.cause = { code: ERR_NODES_NOT_REGISTERED };

        const flowError = FlowError.from(innerError);
        const doubleConverted = FlowError.from(flowError);

        expect(doubleConverted).toBe(flowError); // Same instance after double conversion
        expect(doubleConverted.message).toBe(ERROR_MESSAGES[ERR_NODES_NOT_REGISTERED]);
      });
    });
  });
});
