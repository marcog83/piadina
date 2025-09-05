"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _NodeBuilder_version, _NodeBuilder_semverRange, _NodeBuilder_migrate, _NodeBuilder_assert;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeBuilder = void 0;
var error_codes_1 = require("./error-codes");
/**
 * NodeBuilder is a class that allows you to build a migration node for a versioned object.
 * It provides methods to set the version, semver range, assert function, and an optional migrate function.
 * The assert function is used to validate the input object against the expected schema,
 * and the migrate function is used to transform the input object to the next version.
 * @template TInput - The type of the input object for the migration node.
 * @template TOutput - The type of the output object after migration.
 * @example
 * ```ts
 *  const node = new NodeBuilder<V1,V2>()
 *    .version('1.0.0')
 *    .semverRange('^1.0.0')
 *    .assert((input) => {
 *      // Assert logic for version 1.0.0
 *    })
 *    .migrate((input) => {
 *      // Migration logic for version 1.0.0 -> 2.0.0
 *      return input; // Return the transformed object
 *    })
 *    .build();
 * ```
 * @category Builders
 */
var NodeBuilder = /** @class */ (function () {
    function NodeBuilder() {
        _NodeBuilder_version.set(this, '1.0.0');
        _NodeBuilder_semverRange.set(this, '~1.0.0');
        _NodeBuilder_migrate.set(this, void 0);
        _NodeBuilder_assert.set(this, void 0);
    }
    /**
     * Sets the version for the migration node.
     * The version should follow semantic versioning.
     * Example: "1.0.0", "2.1.3", etc.
     * @param version - The version string to set for the migration node.
     * @returns The current instance of NodeBuilder for method chaining.
     */
    NodeBuilder.prototype.version = function (version) {
        __classPrivateFieldSet(this, _NodeBuilder_version, version, "f");
        return this;
    };
    /**
     * Sets the semver range for the migration node.
     * The semver range defines the versions that this migration node applies to.
     * Example: "^1.0.0", "~2.0.0", etc.
     * @param semverRange - The semver range string to set for the migration node.
     * @returns The current instance of NodeBuilder for method chaining.
     * The semver range should be a valid semver string or a range like `^1.0.0`, `~1.0.0`, etc.
     * It defines the versions that this migration node applies to.
     * For example, `^1.0.0` means it applies to all versions compatible with 1.0.0,
     * while `~1.0.0` means it applies to all versions compatible with 1.0.0 within the minor version.
     * The semver range can also be a specific version
     * like `1.0.0`, or a range like `>=1.0.0`, `<=2.0.0`, `>1.0.0`, `<2.0.0`.
     * This allows for flexible versioning and compatibility checks in the migration process.
     * @example
     * ```ts
     * const node = new NodeBuilder()
     *   .version('1.0.0')
     *   .semverRange('^1.0.0')
     *   .assert((input) => {
     *     // Assert logic for version 1.0.0
     *   })
     *   .migrate((input) => {
     *     // Migration logic for version 1.0.0
     *   })
     *   .build();
     * ```
     */
    NodeBuilder.prototype.semverRange = function (semverRange) {
        __classPrivateFieldSet(this, _NodeBuilder_semverRange, semverRange, "f");
        return this;
    };
    /**
   * Sets the migration function for the migration node.
   * The migration function is called when the migration is applied.
   * @param callback - The migration function to set for the migration node.
   * @returns The current instance of NodeBuilder for method chaining.
   */
    NodeBuilder.prototype.migrate = function (callback) {
        __classPrivateFieldSet(this, _NodeBuilder_migrate, callback, "f");
        return this;
    };
    /**
   * Sets the assert function for the migration node.
   * The assert function is used to validate the input object against the expected schema.
   * It should throw an error if the input does not match the schema.
   * @param callback - The assert function to set for the migration node.
   * @returns The current instance of NodeBuilder for method chaining.
   */
    NodeBuilder.prototype.assert = function (callback) {
        __classPrivateFieldSet(this, _NodeBuilder_assert, callback, "f");
        return this;
    };
    /**
   * Builds the migration node with the configured properties.
   * It creates a MigrationNode object with the version, semver range, assert function, and an optional migrate function.
   * @returns A MigrationNode object that can be used in the migration chain.
   * The MigrationNode object contains the version, semver range, assert function, and an optional migrate function.
   * It can be used to define a migration step in the migration chain.
   * The assert function is used to validate the input object against the expected schema,
   * and the migrate function is used to transform the input object to the next version.
   * If the assert function is not provided, an error will be thrown when building the node.
   * This ensures that the migration node is properly configured before being added to the migration chain.
   * @throws {FlowError} If the assert function is not set when building the node.
   * This error indicates that the migration node is incomplete and cannot be used in the migration process.
   * It is important to set the assert function to ensure that the input object is validated correctly.
   */
    NodeBuilder.prototype.build = function () {
        if (!__classPrivateFieldGet(this, _NodeBuilder_assert, "f")) {
            throw new error_codes_1.FlowError(error_codes_1.ERR_NO_ASSERT_FUNCTION, { version: __classPrivateFieldGet(this, _NodeBuilder_version, "f") });
        }
        return {
            version: __classPrivateFieldGet(this, _NodeBuilder_version, "f"),
            semverRange: __classPrivateFieldGet(this, _NodeBuilder_semverRange, "f"),
            assert: __classPrivateFieldGet(this, _NodeBuilder_assert, "f"),
            migrate: __classPrivateFieldGet(this, _NodeBuilder_migrate, "f"),
        };
    };
    return NodeBuilder;
}());
exports.NodeBuilder = NodeBuilder;
_NodeBuilder_version = new WeakMap(), _NodeBuilder_semverRange = new WeakMap(), _NodeBuilder_migrate = new WeakMap(), _NodeBuilder_assert = new WeakMap();
