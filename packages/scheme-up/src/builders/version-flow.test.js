"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var error_codes_1 = require("./error-codes");
var migration_chain_1 = require("./migration-chain");
var version_flow_1 = require("./version-flow");
var check_validators_1 = require("../__mocks__/check-validators");
(0, vitest_1.describe)('VersionFlow', function () {
    (0, vitest_1.describe)('add', function () {
        (0, vitest_1.it)('should add a migration node to the builder', function () {
            var builder = new version_flow_1.VersionFlow();
            var result = builder.add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(check_validators_1.assertTestV1)
                    .migrate(function (v1) { return ({
                    version: '2.0.0',
                    data: {
                        fullName: v1.data.name,
                        birthYear: new Date().getFullYear() - v1.data.age,
                    },
                }); });
            });
            (0, vitest_1.expect)(result).toBe(builder);
        });
        (0, vitest_1.it)('should allow chaining multiple add calls', function () {
            var builder = new version_flow_1.VersionFlow();
            var result = builder
                .add(function () { })
                .add(function () { })
                .add(function () { });
            (0, vitest_1.expect)(result).toBe(builder);
        });
        (0, vitest_1.it)('should handle empty callback without throwing', function () {
            var builder = new version_flow_1.VersionFlow();
            (0, vitest_1.expect)(function () {
                builder.add(function () { });
            }).not.toThrow();
        });
    });
    (0, vitest_1.describe)('build', function () {
        (0, vitest_1.it)('should create a MigrationChain from added nodes', function () {
            var builder = new version_flow_1.VersionFlow();
            builder.add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(check_validators_1.assertTestV1);
            });
            var chain = builder.build();
            (0, vitest_1.expect)(chain).toBeInstanceOf(migration_chain_1.MigrationChain);
        });
        (0, vitest_1.it)('should create MigrationChain with multiple nodes', function () {
            var builder = new version_flow_1.VersionFlow();
            builder
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(check_validators_1.assertTestV1)
                    .migrate(function (v1) { return ({
                    version: '2.0.0',
                    data: {
                        fullName: v1.data.name,
                        birthYear: new Date().getFullYear() - v1.data.age,
                    },
                }); });
            })
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('2.0.0')
                    .semverRange('^2.0.0')
                    .assert(check_validators_1.assertTestV2)
                    .migrate(function (v2) {
                    var age = new Date().getFullYear() - v2.data.birthYear;
                    return {
                        version: '3.0.0',
                        data: {
                            name: v2.data.fullName,
                            age: age,
                            isAdult: age >= 18,
                        },
                    };
                });
            }).add(function (nodeBuilder) {
                nodeBuilder
                    .version('3.0.0')
                    .semverRange('^3.0.0')
                    .assert(check_validators_1.assertTestV3);
            });
            var chain = builder.build();
            (0, vitest_1.expect)(chain).toBeInstanceOf(migration_chain_1.MigrationChain);
        });
        (0, vitest_1.it)('should create empty MigrationChain when no nodes added', function () {
            var builder = new version_flow_1.VersionFlow();
            var chain = builder.build();
            (0, vitest_1.expect)(chain).toBeInstanceOf(migration_chain_1.MigrationChain);
        });
        (0, vitest_1.it)('should sort migration nodes by version when building', function () {
            var builder = new version_flow_1.VersionFlow();
            // Add nodes in reverse order to test sorting
            builder
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('3.0.0')
                    .semverRange('^3.0.0')
                    .assert(check_validators_1.assertTestV3);
            })
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(check_validators_1.assertTestV1)
                    .migrate(function (v1) { return ({
                    version: '2.0.0',
                    data: {
                        fullName: v1.data.name,
                        birthYear: new Date().getFullYear() - v1.data.age,
                    },
                }); });
            })
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('2.0.0')
                    .semverRange('^2.0.0')
                    .assert(check_validators_1.assertTestV2)
                    .migrate(function (v2) { return ({
                    version: '3.0.0',
                    data: {
                        name: v2.data.fullName,
                        age: new Date().getFullYear() - v2.data.birthYear,
                        isAdult: (new Date().getFullYear() - v2.data.birthYear) >= 18,
                    },
                }); });
            });
            var chain = builder.build();
            (0, vitest_1.expect)(chain).toBeInstanceOf(migration_chain_1.MigrationChain);
            // Test that the chain works correctly with a V1 input (which means nodes are sorted properly)
            var input = {
                version: '1.0.0',
                data: {
                    name: 'John Doe',
                    age: 25,
                },
            };
            var _a = chain.upgradeToLatest(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(true);
            (0, vitest_1.expect)(result).toEqual({
                version: '3.0.0',
                data: {
                    name: 'John Doe',
                    age: 25,
                    isAdult: true,
                },
            });
        });
    });
    (0, vitest_1.describe)('execute', function () {
        (0, vitest_1.it)('should execute migration chain and return final data', function () {
            var builder = new version_flow_1.VersionFlow();
            builder
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(check_validators_1.assertTestV1)
                    .migrate(function (v1) { return ({
                    version: '2.0.0',
                    data: {
                        fullName: v1.data.name,
                        birthYear: new Date().getFullYear() - v1.data.age,
                    },
                }); });
            })
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('2.0.0')
                    .semverRange('^2.0.0')
                    .assert(check_validators_1.assertTestV2)
                    .migrate(function (v2) {
                    var age = new Date().getFullYear() - v2.data.birthYear;
                    return {
                        version: '3.0.0',
                        data: {
                            name: v2.data.fullName,
                            age: age,
                            isAdult: age >= 18,
                        },
                    };
                });
            }).add(function (nodeBuilder) {
                nodeBuilder
                    .version('3.0.0')
                    .semverRange('^3.0.0')
                    .assert(check_validators_1.assertTestV3);
            });
            var input = {
                version: '1.0.0',
                data: {
                    name: 'John Doe',
                    age: 25,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(true);
            (0, vitest_1.expect)(result).toEqual({
                version: '3.0.0',
                data: {
                    name: 'John Doe',
                    age: 25,
                    isAdult: true,
                },
            });
        });
        (0, vitest_1.it)('should handle single migration step', function () {
            var builder = new version_flow_1.VersionFlow();
            builder.add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(check_validators_1.assertTestV1)
                    .migrate(function (v1) { return ({
                    version: '2.0.0',
                    data: {
                        fullName: v1.data.name,
                        birthYear: new Date().getFullYear() - v1.data.age,
                    },
                }); });
            }).add(function (nodeBuilder) {
                nodeBuilder
                    .version('2.0.0')
                    .semverRange('^2.0.0')
                    .assert(check_validators_1.assertTestV2);
            });
            var input = {
                version: '1.0.0',
                data: {
                    name: 'Jane Smith',
                    age: 30,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(true);
            (0, vitest_1.expect)(result).toEqual({
                version: '2.0.0',
                data: {
                    fullName: 'Jane Smith',
                    birthYear: new Date().getFullYear() - 30,
                },
            });
        });
        (0, vitest_1.it)('should throw error for unsupported version', function () {
            var builder = new version_flow_1.VersionFlow();
            builder.add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(check_validators_1.assertTestV1);
            });
            var input = {
                version: '3.0.0',
                data: {
                    name: 'Unknown Version',
                    age: 25,
                    isAdult: true,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(false);
            (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(result.message).toBe('Unsupported input version.');
            (0, vitest_1.expect)(result.cause).toEqual({
                code: error_codes_1.ERR_UNSUPPORTED_VERSION,
                data: { version: '3.0.0' },
            });
        });
        (0, vitest_1.it)('should throw error for input with invalid version type', function () {
            var builder = new version_flow_1.VersionFlow();
            builder.add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(check_validators_1.assertTestV1)
                    .migrate(function (v1) { return ({
                    version: '2.0.0',
                    data: {
                        fullName: v1.data.name,
                        birthYear: new Date().getFullYear() - v1.data.age,
                    },
                }); });
            });
            var input = {
                version: 123,
                data: {
                    name: 'Invalid Version Type',
                    age: 25,
                },
            };
            //@ts-expect-error - version cannot be number
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(false);
            (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(result.message).toBe('Missing or invalid version in input object.');
            (0, vitest_1.expect)(result.cause).toEqual({
                code: error_codes_1.ERR_MISSING_VERSION,
                data: { version: 123 },
            });
        });
        (0, vitest_1.it)('should throw error when no migration nodes are available', function () {
            var builder = new version_flow_1.VersionFlow();
            var input = {
                version: '1.0.0',
                data: {
                    name: 'Test',
                    age: 25,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(false);
            (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(result.message).toBe('No nodes are registered in the VersionFlow.');
            (0, vitest_1.expect)(result.cause).toEqual({
                code: error_codes_1.ERR_NODES_NOT_REGISTERED,
            });
        });
        (0, vitest_1.it)('should throw error when version is missing', function () {
            var builder = new version_flow_1.VersionFlow();
            builder.add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(check_validators_1.assertTestV1);
            });
            var input = {
                data: {
                    name: 'Test',
                    age: 25,
                },
            };
            //@ts-expect-error - version cannot be undefined
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(false);
            (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(result.message).toBe('Missing or invalid version in input object.');
            (0, vitest_1.expect)(result.cause).toEqual({
                code: error_codes_1.ERR_MISSING_VERSION,
                data: { version: undefined },
            });
        });
        (0, vitest_1.it)('should throw error when version is null', function () {
            var builder = new version_flow_1.VersionFlow();
            builder.add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(check_validators_1.assertTestV1);
            });
            var input = {
                version: null,
                data: {
                    name: 'Test',
                    age: 25,
                },
            };
            //@ts-expect-error - version cannot be null
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(false);
            (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(result.message).toBe('Missing or invalid version in input object.');
            (0, vitest_1.expect)(result.cause).toEqual({
                code: error_codes_1.ERR_MISSING_VERSION,
                data: { version: null },
            });
        });
        (0, vitest_1.it)('should handle non-Error objects thrown during migration', function () {
            var builder = new version_flow_1.VersionFlow();
            builder.add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(function () {
                    // eslint-disable-next-line @typescript-eslint/only-throw-error
                    throw 'This is a string error, not an Error object';
                });
            });
            var input = {
                version: '1.0.0',
                data: {
                    name: 'Test',
                    age: 25,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(false);
            (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(result.message).toBe('Unknown error during validation.');
            (0, vitest_1.expect)(result.cause).toEqual({
                code: error_codes_1.ERR_UNKNOWN,
                data: 'This is a string error, not an Error object',
            });
        });
        (0, vitest_1.it)('should handle objects thrown during migration', function () {
            var builder = new version_flow_1.VersionFlow();
            builder.add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(function () {
                    // eslint-disable-next-line @typescript-eslint/only-throw-error
                    throw { message: 'Custom error object', code: 'CUSTOM_ERROR' };
                });
            });
            var input = {
                version: '1.0.0',
                data: {
                    name: 'Test',
                    age: 25,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(false);
            (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(result.message).toBe('Unknown error during validation.');
            (0, vitest_1.expect)(result.cause).toEqual({
                code: error_codes_1.ERR_UNKNOWN,
                data: { message: 'Custom error object', code: 'CUSTOM_ERROR' },
            });
        });
        (0, vitest_1.it)('should handle numbers thrown during migration', function () {
            var builder = new version_flow_1.VersionFlow();
            builder.add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(function () {
                    // eslint-disable-next-line @typescript-eslint/only-throw-error
                    throw 42;
                });
            });
            var input = {
                version: '1.0.0',
                data: {
                    name: 'Test',
                    age: 25,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(false);
            (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(result.message).toBe('Unknown error during validation.');
            (0, vitest_1.expect)(result.cause).toEqual({
                code: error_codes_1.ERR_UNKNOWN,
                data: 42,
            });
        });
    });
    (0, vitest_1.describe)('integration scenarios', function () {
        (0, vitest_1.it)('should work with same input and output types', function () {
            var builder = new version_flow_1.VersionFlow();
            builder.add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(function (input) { return input; })
                    .migrate(function (input) { return (__assign(__assign({}, input), { data: {
                        value: input.data.value * 2,
                    } })); });
            });
            var input = {
                version: '1.0.0',
                data: {
                    value: 5,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(true);
            (0, vitest_1.expect)(result).toEqual({
                version: '1.0.0',
                data: {
                    value: 10,
                },
            });
        });
    });
    (0, vitest_1.describe)('catch', function () {
        (0, vitest_1.it)('should set catch callback and return builder instance', function () {
            var builder = new version_flow_1.VersionFlow();
            var catchCallback = function () { };
            var result = builder.catch(catchCallback);
            (0, vitest_1.expect)(result).toBe(builder);
        });
        (0, vitest_1.it)('should call catch callback when execute throws an error', function () {
            var builder = new version_flow_1.VersionFlow();
            var caughtError = null;
            builder
                .catch(function (error) {
                caughtError = error;
            })
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(check_validators_1.assertTestV1)
                    .migrate(function () {
                    throw new Error('Migration failed');
                });
            });
            var input = {
                version: '1.0.0',
                data: {
                    name: 'John Doe',
                    age: 25,
                },
            };
            // execute should not throw, but should call catch callback
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(false);
            (0, vitest_1.expect)(caughtError).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(caughtError.message).toBe('Unknown error during validation.');
            (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(result.message).toBe('Unknown error during validation.');
            (0, vitest_1.expect)(result.cause).toEqual({
                code: error_codes_1.ERR_UNKNOWN,
                data: 'Migration failed',
            });
        });
        (0, vitest_1.it)('should call catch callback when assertion fails', function () {
            var builder = new version_flow_1.VersionFlow();
            var caughtError = null;
            builder
                .catch(function (error) {
                caughtError = error;
            })
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(function () {
                    throw new Error('Assertion failed');
                })
                    .migrate(function (v1) { return ({
                    version: '2.0.0',
                    data: {
                        fullName: v1.data.name,
                        birthYear: new Date().getFullYear() - v1.data.age,
                    },
                }); });
            });
            var input = {
                version: '1.0.0',
                data: {
                    name: 'John Doe',
                    age: 25,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(false);
            (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(result.message).toBe('Unknown error during validation.');
            (0, vitest_1.expect)(result.cause).toEqual({
                code: error_codes_1.ERR_UNKNOWN,
                data: 'Assertion failed',
            });
            (0, vitest_1.expect)(caughtError).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(caughtError.message).toBe('Unknown error during validation.');
        });
        (0, vitest_1.it)('should call catch callback for unsupported version errors', function () {
            var builder = new version_flow_1.VersionFlow();
            var caughtError = null;
            builder
                .catch(function (error) {
                caughtError = error;
            })
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(check_validators_1.assertTestV1);
            });
            var input = {
                version: '3.0.0',
                data: {
                    name: 'Unknown Version',
                    age: 25,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(false);
            (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(caughtError).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(result.message).toBe('Unsupported input version.');
            (0, vitest_1.expect)(caughtError.message).toBe('Unsupported input version.');
            (0, vitest_1.expect)(result.cause).toEqual({
                code: error_codes_1.ERR_UNSUPPORTED_VERSION,
                data: { version: '3.0.0' },
            });
            (0, vitest_1.expect)(caughtError.cause).toEqual({
                code: error_codes_1.ERR_UNSUPPORTED_VERSION,
                data: { version: '3.0.0' },
            });
        });
        (0, vitest_1.it)('should call catch callback for invalid version type errors', function () {
            var builder = new version_flow_1.VersionFlow();
            var caughtError = null;
            builder
                .catch(function (error) {
                caughtError = error;
            })
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(check_validators_1.assertTestV1);
            });
            var input = {
                version: 123, // Invalid version type
                data: {
                    name: 'Invalid Version Type',
                    age: 25,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(false);
            (0, vitest_1.expect)(result).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(result.message).toBe('Missing or invalid version in input object.');
            (0, vitest_1.expect)(caughtError).toBeInstanceOf(error_codes_1.FlowError);
            (0, vitest_1.expect)(caughtError.message).toBe('Missing or invalid version in input object.');
            (0, vitest_1.expect)(result.cause).toEqual({
                code: error_codes_1.ERR_MISSING_VERSION,
                data: { version: 123 },
            });
            (0, vitest_1.expect)(caughtError.cause).toEqual({
                code: error_codes_1.ERR_MISSING_VERSION,
                data: { version: 123 },
            });
        });
        (0, vitest_1.it)('should allow catch callback to return a value', function () {
            var builder = new version_flow_1.VersionFlow();
            var fallbackValue = {
                version: '1.0.0',
                data: {
                    name: 'Fallback',
                    age: 0,
                },
            };
            builder
                .catch(function () { return fallbackValue; })
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(function () {
                    throw new Error('Assertion failed');
                });
            });
            var input = {
                version: '1.0.0',
                data: {
                    name: 'John Doe',
                    age: 25,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(true);
            (0, vitest_1.expect)(result).toEqual(fallbackValue);
        });
        (0, vitest_1.it)('should handle catch callback that throws an error', function () {
            var builder = new version_flow_1.VersionFlow();
            builder
                .catch(function () {
                throw new Error('Catch callback error');
            })
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(function () {
                    throw new Error('Original error');
                });
            });
            var input = {
                version: '1.0.0',
                data: {
                    name: 'John Doe',
                    age: 25,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(false);
            (0, vitest_1.expect)(result).toBeInstanceOf(Error);
            (0, vitest_1.expect)(result.message).toBe('Unknown error during validation.');
            (0, vitest_1.expect)(result.cause).toEqual({
                code: error_codes_1.ERR_UNKNOWN,
                data: 'Catch callback error',
            });
        });
        (0, vitest_1.it)('should handle catch callback that throws non-Error object', function () {
            var builder = new version_flow_1.VersionFlow();
            builder
                .catch(function () {
                // eslint-disable-next-line @typescript-eslint/only-throw-error
                throw 'String error';
            })
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(function () {
                    throw new Error('Original error');
                });
            });
            var input = {
                version: '1.0.0',
                data: {
                    name: 'John Doe',
                    age: 25,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(false);
            (0, vitest_1.expect)(result).toBeInstanceOf(Error);
            (0, vitest_1.expect)(result.message).toBe('Unknown error during validation.');
            (0, vitest_1.expect)(result.cause).toEqual({
                code: error_codes_1.ERR_UNKNOWN,
                data: 'String error',
            });
        });
        (0, vitest_1.it)('should not call catch callback when execution succeeds', function () {
            var builder = new version_flow_1.VersionFlow();
            var catchCallbackCalled = false;
            builder
                .catch(function () {
                catchCallbackCalled = true;
            })
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(check_validators_1.assertTestV1)
                    .migrate(function (v1) { return ({
                    version: '2.0.0',
                    data: {
                        fullName: v1.data.name,
                        birthYear: new Date().getFullYear() - v1.data.age,
                    },
                }); });
            })
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('2.0.0')
                    .semverRange('^2.0.0')
                    .assert(check_validators_1.assertTestV2);
            });
            var input = {
                version: '1.0.0',
                data: {
                    name: 'John Doe',
                    age: 25,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(isSuccess).toBe(true);
            (0, vitest_1.expect)(catchCallbackCalled).toBe(false);
            (0, vitest_1.expect)(result).toEqual({
                version: '2.0.0',
                data: {
                    fullName: 'John Doe',
                    birthYear: new Date().getFullYear() - 25,
                },
            });
        });
        (0, vitest_1.it)('should allow overriding catch callback', function () {
            var builder = new version_flow_1.VersionFlow();
            var firstCallbackCalled = false;
            var secondCallbackCalled = false;
            var fallbackValue = {
                version: '1.0.0',
                data: {
                    name: 'John Doe',
                    age: 25,
                },
            };
            builder
                .catch(function () {
                firstCallbackCalled = true;
            })
                .catch(function () {
                secondCallbackCalled = true;
                return fallbackValue;
            })
                .add(function (nodeBuilder) {
                nodeBuilder
                    .version('1.0.0')
                    .semverRange('^1.0.0')
                    .assert(function () {
                    throw new Error('Test error');
                });
            });
            var input = {
                version: '1.0.0',
                data: {
                    name: 'John Doe',
                    age: 25,
                },
            };
            var _a = builder.execute(input), isSuccess = _a[0], result = _a[1];
            (0, vitest_1.expect)(firstCallbackCalled).toBe(false);
            (0, vitest_1.expect)(secondCallbackCalled).toBe(true);
            (0, vitest_1.expect)(isSuccess).toBe(true);
            (0, vitest_1.expect)(result).toEqual(fallbackValue);
        });
    });
});
