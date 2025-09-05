"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var error_codes_1 = require("./error-codes");
(0, vitest_1.describe)('Error Codes', function () {
    (0, vitest_1.describe)('Error Code Constants', function () {
        (0, vitest_1.it)('should have correct error code values', function () {
            (0, vitest_1.expect)(error_codes_1.ERR_NODES_NOT_REGISTERED).toBe('FLOW-0001');
            (0, vitest_1.expect)(error_codes_1.ERR_UNSUPPORTED_VERSION).toBe('FLOW-0002');
            (0, vitest_1.expect)(error_codes_1.ERR_MISSING_VERSION).toBe('FLOW-0003');
            (0, vitest_1.expect)(error_codes_1.ERR_NO_MIGRATION_NODE_FOUND).toBe('FLOW-0004');
            (0, vitest_1.expect)(error_codes_1.ERR_UNKNOWN).toBe('FLOW-0005');
            (0, vitest_1.expect)(error_codes_1.ERR_NO_ASSERT_FUNCTION).toBe('FLOW-0006');
        });
    });
    (0, vitest_1.describe)('FlowError', function () {
        (0, vitest_1.describe)('constructor', function () {
            (0, vitest_1.it)('should create FlowError with error code and message', function () {
                var error = new error_codes_1.FlowError(error_codes_1.ERR_NO_ASSERT_FUNCTION);
                (0, vitest_1.expect)(error).toBeInstanceOf(Error);
                (0, vitest_1.expect)(error).toBeInstanceOf(error_codes_1.FlowError);
                (0, vitest_1.expect)(error.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_NO_ASSERT_FUNCTION]);
                (0, vitest_1.expect)(error.cause).toEqual({
                    code: error_codes_1.ERR_NO_ASSERT_FUNCTION,
                });
            });
            (0, vitest_1.it)('should create FlowError with error code and data', function () {
                var testData = { version: '1.0.0' };
                var error = new error_codes_1.FlowError(error_codes_1.ERR_NO_ASSERT_FUNCTION, testData);
                (0, vitest_1.expect)(error.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_NO_ASSERT_FUNCTION]);
                (0, vitest_1.expect)(error.cause).toEqual({
                    code: error_codes_1.ERR_NO_ASSERT_FUNCTION,
                    data: testData,
                });
            });
            vitest_1.it.each([
                [error_codes_1.ERR_NODES_NOT_REGISTERED],
                [error_codes_1.ERR_UNSUPPORTED_VERSION],
                [error_codes_1.ERR_MISSING_VERSION],
                [error_codes_1.ERR_NO_MIGRATION_NODE_FOUND],
            ])('should create FlowError for all error codes', function (code) {
                var error = new error_codes_1.FlowError(code);
                (0, vitest_1.expect)(error.message).toBe(error_codes_1.ERROR_MESSAGES[code]);
                (0, vitest_1.expect)(error.cause).toEqual({
                    code: code,
                });
            });
            (0, vitest_1.it)('should create FlowError with complex data object', function () {
                var complexData = {
                    version: '2.1.0',
                    input: { name: 'test', age: 25 },
                    metadata: { timestamp: Date.now(), source: 'test' },
                };
                var error = new error_codes_1.FlowError(error_codes_1.ERR_UNSUPPORTED_VERSION, complexData);
                (0, vitest_1.expect)(error.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_UNSUPPORTED_VERSION]);
                (0, vitest_1.expect)(error.cause).toEqual({
                    code: error_codes_1.ERR_UNSUPPORTED_VERSION,
                    data: complexData,
                });
            });
            (0, vitest_1.it)('should create FlowError with empty data object', function () {
                var error = new error_codes_1.FlowError(error_codes_1.ERR_MISSING_VERSION, {});
                (0, vitest_1.expect)(error.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_MISSING_VERSION]);
                (0, vitest_1.expect)(error.cause).toEqual({
                    code: error_codes_1.ERR_MISSING_VERSION,
                    data: {},
                });
            });
        });
        (0, vitest_1.describe)('from static method', function () {
            (0, vitest_1.it)('should return same FlowError instance when passed FlowError', function () {
                var originalError = new error_codes_1.FlowError(error_codes_1.ERR_NO_ASSERT_FUNCTION, { version: '1.0.0' });
                var result = error_codes_1.FlowError.from(originalError);
                (0, vitest_1.expect)(result).toBe(originalError);
                (0, vitest_1.expect)(result.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_NO_ASSERT_FUNCTION]);
                (0, vitest_1.expect)(result.cause).toEqual({
                    code: error_codes_1.ERR_NO_ASSERT_FUNCTION,
                    data: { version: '1.0.0' },
                });
            });
            (0, vitest_1.it)('should convert Error with cause to FlowError', function () {
                var originalError = new Error('Custom error message');
                originalError.cause = {
                    code: error_codes_1.ERR_UNSUPPORTED_VERSION,
                    data: { version: '3.0.0' },
                };
                var result = error_codes_1.FlowError.from(originalError);
                (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
                (0, vitest_1.expect)(result).not.toBe(originalError);
                (0, vitest_1.expect)(result.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_UNSUPPORTED_VERSION]);
                (0, vitest_1.expect)(result.cause).toEqual(originalError.cause);
            });
            (0, vitest_1.it)('should convert Error without cause to FlowError with UNKNOWN error', function () {
                var originalError = new Error('Some unexpected error');
                var result = error_codes_1.FlowError.from(originalError);
                (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
                (0, vitest_1.expect)(result).not.toBe(originalError);
                (0, vitest_1.expect)(result.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_UNKNOWN]);
                (0, vitest_1.expect)(result.cause).toEqual({
                    code: error_codes_1.ERR_UNKNOWN,
                    data: 'Some unexpected error',
                });
            });
            (0, vitest_1.it)('should convert Error with invalid cause to FlowError with UNKNOWN error', function () {
                var originalError = new Error('Error with invalid cause');
                originalError.cause = { invalidProperty: 'test' };
                var result = error_codes_1.FlowError.from(originalError);
                (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
                (0, vitest_1.expect)(result.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_UNKNOWN]);
                (0, vitest_1.expect)(result.cause).toEqual({
                    code: error_codes_1.ERR_UNKNOWN,
                    data: 'Error with invalid cause',
                });
            });
            (0, vitest_1.it)('should convert Error with empty message to FlowError', function () {
                var originalError = new Error('');
                var result = error_codes_1.FlowError.from(originalError);
                (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
                (0, vitest_1.expect)(result.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_UNKNOWN]);
                (0, vitest_1.expect)(result.cause).toEqual({
                    code: error_codes_1.ERR_UNKNOWN,
                    data: '',
                });
            });
            (0, vitest_1.it)('should convert string to FlowError', function () {
                var errorString = 'This is a string error';
                var result = error_codes_1.FlowError.from(errorString);
                (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
                (0, vitest_1.expect)(result.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_UNKNOWN]);
                (0, vitest_1.expect)(result.cause).toEqual({
                    code: error_codes_1.ERR_UNKNOWN,
                    data: errorString,
                });
            });
            (0, vitest_1.it)('should not convert number to FlowError', function () {
                var errorNumber = 404;
                var result = error_codes_1.FlowError.from(errorNumber);
                (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
                (0, vitest_1.expect)(result.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_UNKNOWN]);
                (0, vitest_1.expect)(result.cause).toEqual({
                    code: error_codes_1.ERR_UNKNOWN,
                    data: errorNumber,
                });
            });
            (0, vitest_1.it)('should not convert object to FlowError', function () {
                var errorObject = { type: 'CustomError', details: 'Something went wrong' };
                var result = error_codes_1.FlowError.from(errorObject);
                (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
                (0, vitest_1.expect)(result.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_UNKNOWN]);
                (0, vitest_1.expect)(result.cause).toEqual({
                    code: error_codes_1.ERR_UNKNOWN,
                    data: errorObject,
                });
            });
            (0, vitest_1.it)('should not convert null to FlowError', function () {
                var result = error_codes_1.FlowError.from(null);
                (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
                (0, vitest_1.expect)(result.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_UNKNOWN]);
                (0, vitest_1.expect)(result.cause).toEqual({
                    code: error_codes_1.ERR_UNKNOWN,
                    data: null,
                });
            });
            (0, vitest_1.it)('should not convert undefined to FlowError', function () {
                var result = error_codes_1.FlowError.from(undefined);
                (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
                (0, vitest_1.expect)(result.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_UNKNOWN]);
                (0, vitest_1.expect)(result.cause).toEqual({
                    code: error_codes_1.ERR_UNKNOWN,
                    data: undefined,
                });
            });
            (0, vitest_1.it)('should not convert boolean to FlowError', function () {
                var result = error_codes_1.FlowError.from(false);
                (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
                (0, vitest_1.expect)(result.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_UNKNOWN]);
                (0, vitest_1.expect)(result.cause).toEqual({
                    code: error_codes_1.ERR_UNKNOWN,
                    data: false,
                });
            });
            (0, vitest_1.it)('should not convert array to FlowError', function () {
                var errorArray = ['error1', 'error2'];
                var result = error_codes_1.FlowError.from(errorArray);
                (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
                (0, vitest_1.expect)(result.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_UNKNOWN]);
                (0, vitest_1.expect)(result.cause).toEqual({
                    code: error_codes_1.ERR_UNKNOWN,
                    data: errorArray,
                });
            });
        });
        (0, vitest_1.describe)('error inheritance', function () {
            (0, vitest_1.it)('should inherit from Error correctly', function () {
                var error = new error_codes_1.FlowError(error_codes_1.ERR_NO_ASSERT_FUNCTION);
                (0, vitest_1.expect)(error instanceof Error).toBe(true);
                (0, vitest_1.expect)(error instanceof error_codes_1.FlowError).toBe(true);
                (0, vitest_1.expect)(error.name).toBe('FlowError');
                (0, vitest_1.expect)(typeof error.stack).toBe('string');
            });
            (0, vitest_1.it)('should be catchable as Error', function () {
                (0, vitest_1.expect)(function () {
                    throw new error_codes_1.FlowError(error_codes_1.ERR_UNKNOWN);
                }).toThrow(Error);
                (0, vitest_1.expect)(function () {
                    throw new error_codes_1.FlowError(error_codes_1.ERR_UNKNOWN);
                }).toThrow(error_codes_1.FlowError);
            });
            (0, vitest_1.it)('should have proper error properties', function () {
                var error = new error_codes_1.FlowError(error_codes_1.ERR_UNSUPPORTED_VERSION, { version: '2.0.0' });
                (0, vitest_1.expect)(error.message).toBeTruthy();
                (0, vitest_1.expect)(error.cause).toBeTruthy();
                (0, vitest_1.expect)(error.stack).toBeTruthy();
            });
        });
        (0, vitest_1.describe)('integration scenarios', function () {
            (0, vitest_1.it)('should work in try-catch blocks', function () {
                var caughtError = null;
                try {
                    throw new error_codes_1.FlowError(error_codes_1.ERR_NO_MIGRATION_NODE_FOUND);
                }
                catch (error) {
                    caughtError = error;
                }
                (0, vitest_1.expect)(caughtError).toBeInstanceOf(error_codes_1.FlowError);
                (0, vitest_1.expect)(caughtError === null || caughtError === void 0 ? void 0 : caughtError.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_NO_MIGRATION_NODE_FOUND]);
            });
            (0, vitest_1.it)('should preserve cause information through conversions', function () {
                var originalData = { version: '1.5.0', input: { test: true } };
                var error1 = new error_codes_1.FlowError(error_codes_1.ERR_MISSING_VERSION, originalData);
                var error2 = error_codes_1.FlowError.from(error1);
                (0, vitest_1.expect)(error2).toBe(error1); // Same instance
                (0, vitest_1.expect)(error2.cause).toEqual({
                    code: error_codes_1.ERR_MISSING_VERSION,
                    data: originalData,
                });
            });
            (0, vitest_1.it)('should handle nested error conversions', function () {
                var innerError = new Error('Inner error');
                innerError.cause = { code: error_codes_1.ERR_NODES_NOT_REGISTERED };
                var flowError = error_codes_1.FlowError.from(innerError);
                var doubleConverted = error_codes_1.FlowError.from(flowError);
                (0, vitest_1.expect)(doubleConverted).toBe(flowError); // Same instance after double conversion
                (0, vitest_1.expect)(doubleConverted.message).toBe(error_codes_1.ERROR_MESSAGES[error_codes_1.ERR_NODES_NOT_REGISTERED]);
            });
        });
    });
});
