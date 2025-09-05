"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var error_codes_1 = require("./error-codes");
var node_builder_1 = require("./node-builder");
var check_validators_1 = require("../__mocks__/check-validators");
(0, vitest_1.describe)('NodeBuilder', function () {
    (0, vitest_1.describe)('version', function () {
        (0, vitest_1.it)('should set version and return builder instance', function () {
            var builder = new node_builder_1.NodeBuilder();
            var result = builder.version('1.0.0');
            (0, vitest_1.expect)(result).toBe(builder);
        });
        (0, vitest_1.it)('should allow method chaining with version', function () {
            var builder = new node_builder_1.NodeBuilder();
            var result = builder
                .version('1.0.0')
                .semverRange('^1.0.0')
                .assert(check_validators_1.assertTestV1);
            (0, vitest_1.expect)(result).toBe(builder);
        });
    });
    (0, vitest_1.describe)('semverRange', function () {
        (0, vitest_1.it)('should set semver range and return builder instance', function () {
            var builder = new node_builder_1.NodeBuilder();
            var result = builder.semverRange('^1.0.0');
            (0, vitest_1.expect)(result).toBe(builder);
        });
        (0, vitest_1.it)('should work with different semver range patterns', function () {
            var builder = new node_builder_1.NodeBuilder();
            (0, vitest_1.expect)(function () {
                builder
                    .semverRange('~1.0.0')
                    .version('1.0.0')
                    .assert(check_validators_1.assertTestV1)
                    .build();
            }).not.toThrow();
        });
    });
    (0, vitest_1.describe)('migrate', function () {
        (0, vitest_1.it)('should set migrate function and return builder instance', function () {
            var builder = new node_builder_1.NodeBuilder();
            var migrateFunction = function (input) { return ({
                version: '2.0.0',
                data: {
                    fullName: input.data.name,
                    birthYear: new Date().getFullYear() - input.data.age,
                },
            }); };
            var result = builder.migrate(migrateFunction);
            (0, vitest_1.expect)(result).toBe(builder);
        });
        (0, vitest_1.it)('should allow building node without migrate function', function () {
            var builder = new node_builder_1.NodeBuilder();
            var node = builder
                .version('1.0.0')
                .semverRange('^1.0.0')
                .assert(check_validators_1.assertTestV1)
                .build();
            (0, vitest_1.expect)(node.migrate).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('assert', function () {
        (0, vitest_1.it)('should set assert function and return builder instance', function () {
            var builder = new node_builder_1.NodeBuilder();
            var result = builder.assert(check_validators_1.assertTestV1);
            (0, vitest_1.expect)(result).toBe(builder);
        });
        (0, vitest_1.it)('should work with custom assert function', function () {
            var builder = new node_builder_1.NodeBuilder();
            var customAssert = function (input) {
                if (!input) {
                    throw new Error('Input is required');
                }
            };
            var node = builder
                .version('1.0.0')
                .semverRange('^1.0.0')
                .assert(customAssert)
                .build();
            (0, vitest_1.expect)(node.assert).toBe(customAssert);
        });
    });
    (0, vitest_1.describe)('build', function () {
        (0, vitest_1.it)('should build migration node with all properties', function () {
            var builder = new node_builder_1.NodeBuilder();
            var migrateFunction = function (input) { return ({
                version: '2.0.0',
                data: {
                    fullName: input.data.name,
                    birthYear: new Date().getFullYear() - input.data.age,
                },
            }); };
            var node = builder
                .version('1.0.0')
                .semverRange('^1.0.0')
                .assert(check_validators_1.assertTestV1)
                .migrate(migrateFunction)
                .build();
            (0, vitest_1.expect)(node.version).toBe('1.0.0');
            (0, vitest_1.expect)(node.semverRange).toBe('^1.0.0');
            (0, vitest_1.expect)(node.assert).toBe(check_validators_1.assertTestV1);
            (0, vitest_1.expect)(node.migrate).toBe(migrateFunction);
        });
        (0, vitest_1.it)('should build migration node without migrate function', function () {
            var builder = new node_builder_1.NodeBuilder();
            var node = builder
                .version('1.0.0')
                .semverRange('^1.0.0')
                .assert(check_validators_1.assertTestV1)
                .build();
            (0, vitest_1.expect)(node.version).toBe('1.0.0');
            (0, vitest_1.expect)(node.semverRange).toBe('^1.0.0');
            (0, vitest_1.expect)(node.assert).toBe(check_validators_1.assertTestV1);
            (0, vitest_1.expect)(node.migrate).toBeUndefined();
        });
        (0, vitest_1.it)('should use default values when not explicitly set', function () {
            var builder = new node_builder_1.NodeBuilder();
            var node = builder
                .assert(check_validators_1.assertTestV1)
                .build();
            (0, vitest_1.expect)(node.version).toBe('1.0.0');
            (0, vitest_1.expect)(node.semverRange).toBe('~1.0.0');
            (0, vitest_1.expect)(node.assert).toBe(check_validators_1.assertTestV1);
            (0, vitest_1.expect)(node.migrate).toBeUndefined();
        });
        (0, vitest_1.it)('should throw error when assert function is not provided', function () {
            var builder = new node_builder_1.NodeBuilder();
            builder
                .version('1.0.0')
                .semverRange('^1.0.0');
            (0, vitest_1.expect)(function () { return builder.build(); }).toThrow('No assert function provided for validation node.');
            try {
                builder.build();
            }
            catch (error) {
                (0, vitest_1.expect)(error).toBeInstanceOf(Error);
                (0, vitest_1.expect)(error.cause).toEqual({
                    code: error_codes_1.ERR_NO_ASSERT_FUNCTION,
                    data: { version: '1.0.0' },
                });
            }
        });
        (0, vitest_1.it)('should throw error with version data when assert function is missing', function () {
            var builder = new node_builder_1.NodeBuilder();
            builder
                .version('2.5.0')
                .semverRange('^2.0.0');
            (0, vitest_1.expect)(function () { return builder.build(); }).toThrow('No assert function provided for validation node.');
            try {
                builder.build();
            }
            catch (error) {
                (0, vitest_1.expect)(error).toBeInstanceOf(Error);
                (0, vitest_1.expect)(error.cause).toEqual({
                    code: error_codes_1.ERR_NO_ASSERT_FUNCTION,
                    data: { version: '2.5.0' },
                });
            }
        });
        (0, vitest_1.it)('should throw error even when migrate function is provided but assert is missing', function () {
            var builder = new node_builder_1.NodeBuilder();
            var migrateFunction = function (input) { return ({
                version: '2.0.0',
                data: {
                    fullName: input.data.name,
                    birthYear: new Date().getFullYear() - input.data.age,
                },
            }); };
            builder
                .version('1.0.0')
                .semverRange('^1.0.0')
                .migrate(migrateFunction);
            (0, vitest_1.expect)(function () { return builder.build(); }).toThrow('No assert function provided for validation node.');
            try {
                builder.build();
            }
            catch (error) {
                (0, vitest_1.expect)(error).toBeInstanceOf(Error);
                (0, vitest_1.expect)(error.cause).toEqual({
                    code: error_codes_1.ERR_NO_ASSERT_FUNCTION,
                    data: { version: '1.0.0' },
                });
            }
        });
    });
    (0, vitest_1.describe)('method chaining', function () {
        (0, vitest_1.it)('should support full method chaining', function () {
            var builder = new node_builder_1.NodeBuilder();
            var migrateFunction = function (input) { return ({
                version: '2.0.0',
                data: {
                    fullName: input.data.name,
                    birthYear: new Date().getFullYear() - input.data.age,
                },
            }); };
            var node = builder
                .version('1.0.0')
                .semverRange('^1.0.0')
                .assert(check_validators_1.assertTestV1)
                .migrate(migrateFunction)
                .build();
            (0, vitest_1.expect)(node).toBeDefined();
            (0, vitest_1.expect)(node.version).toBe('1.0.0');
            (0, vitest_1.expect)(node.semverRange).toBe('^1.0.0');
            (0, vitest_1.expect)(node.assert).toBe(check_validators_1.assertTestV1);
            (0, vitest_1.expect)(node.migrate).toBe(migrateFunction);
        });
        (0, vitest_1.it)('should support partial method chaining', function () {
            var builder = new node_builder_1.NodeBuilder();
            builder.version('1.0.0');
            builder.semverRange('^1.0.0');
            builder.assert(check_validators_1.assertTestV1);
            var node = builder.build();
            (0, vitest_1.expect)(node).toBeDefined();
            (0, vitest_1.expect)(node.version).toBe('1.0.0');
            (0, vitest_1.expect)(node.semverRange).toBe('^1.0.0');
            (0, vitest_1.expect)(node.assert).toBe(check_validators_1.assertTestV1);
            (0, vitest_1.expect)(node.migrate).toBeUndefined();
        });
    });
});
