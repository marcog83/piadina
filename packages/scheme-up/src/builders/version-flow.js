"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _VersionFlow_nodes, _VersionFlow_catch;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionFlow = void 0;
var semver_1 = require("semver");
var error_codes_1 = require("./error-codes");
var migration_chain_1 = require("./migration-chain");
var node_builder_1 = require("./node-builder");
/**
 * VersionFlow is a class that allows you to build a migration flow for versioned objects.
 * It provides methods to add migration nodes and execute the migration process.
 * It can handle versioned objects and apply migrations based on their version.
 * It also supports error handling through a catch callback.
 * @template TFinalOutput - The type of the final output after all migrations are applied.
 * @example
 * ```tsx
 * const flow = new VersionFlow<MyFinalOutput>();
 * flow
 *   .add((builder) => {
 *     builder
 *       .version('1.0.0')
 *       .semverRange('^1.0.0')
 *       .assert((input) => {
 *         // Assert logic for version 1.0.0
 *       })
 *       .migrate((input) => {
 *         // Migration logic for version 1.0.0
 *       })
 *   });
 * ```
 * @category Builders
 */
var VersionFlow = /** @class */ (function () {
    function VersionFlow() {
        _VersionFlow_nodes.set(this, []);
        _VersionFlow_catch.set(this, void 0);
    }
    /**
   * Adds a migration node to the flow.
   * The node is built using the provided callback function, which receives a NodeBuilder instance.
   * @param callback - A callback function that receives a NodeBuilder instance to configure the migration node.
   * The callback should set the version, semver range, assert function, and optionally a migrate function.
   * The NodeBuilder instance is used to build a migration node that can be added to the flow.
   *
   */
    VersionFlow.prototype.add = function (callback) {
        var nodeBuilder = new node_builder_1.NodeBuilder();
        callback(nodeBuilder);
        __classPrivateFieldGet(this, _VersionFlow_nodes, "f").push(nodeBuilder);
        return this;
    };
    /**
   * Builds the migration chain from the added nodes.
   * It creates a MigrationChain instance with the configured nodes.
   * @returns A MigrationChain instance that can be used to execute the migration process.
   * The MigrationChain instance contains all the migration nodes that were added to the flow.
   * Each node is built using the NodeBuilder instances that were configured in the add method.
   * The MigrationChain can be used to upgrade a versioned object to the latest version by applying
   * the migrations defined in the nodes.
   */
    VersionFlow.prototype.build = function () {
        var nodes = __classPrivateFieldGet(this, _VersionFlow_nodes, "f")
            .map(function (nodeBuilder) { return nodeBuilder.build(); })
            .sort(function (a, b) { return semver_1.default.compare(a.version, b.version); });
        return new migration_chain_1.MigrationChain(nodes);
    };
    /**
   * Executes the migration process on the provided versioned object.
   * It applies the migrations defined in the nodes and returns the result.
   * If an error occurs during the migration, it will attempt to recover using the catch callback if provided.
   * @param input - The versioned object to be migrated. It should have a 'version' property
   * that matches the semver range of the migration nodes.
   * The input object should conform to the VersionedObject type, which includes a 'version' property.
   * The version should be a valid semver version string
   * that matches one of the semver ranges defined in the migration nodes.
   * @example
   * ```tsx
   * const [isSuccess,result] = flow.execute({ version: '1.0.0', data: { name: 'example', age: 30 } });
   * if (isSuccess) {
   *   const migratedObject = result; // The migrated object of type TFinalOutput
   * } else {
   *   const error = result; // The error that occurred during migration
   * }
   * ```
   * @returns A SchemeResult containing either the migrated object or an error.
   * If the migration is successful, it returns a tuple with true and the migrated object of type TFinalOutput.
   * If an error occurs, it returns a tuple with false and the error object.
   * If a catch callback is provided, it will be called with the error, and if it returns a value,
   * that value will be returned as the result instead of the error.
   * If the catch callback throws an error, it will be returned as the error result.
   * @throws {FlowError} If an error occurs during migration and no catch callback is provided,
   * or catch callback fails to recover.
   */
    VersionFlow.prototype.execute = function (input) {
        var response = this.build().upgradeToLatest(input);
        var isSuccess = response[0], result = response[1];
        if (!isSuccess && __classPrivateFieldGet(this, _VersionFlow_catch, "f")) {
            try {
                var recoverValue = __classPrivateFieldGet(this, _VersionFlow_catch, "f").call(this, result);
                if (recoverValue) {
                    return [true, recoverValue];
                }
            }
            catch (error) {
                return [
                    false,
                    error_codes_1.FlowError.from(error),
                ];
            }
        }
        return response;
    };
    /**
   * Sets the catch callback for handling errors during migration.
   * The catch callback is called when an error occurs during the migration process.
   * It can return a value to recover from the error, or it can throw an error to propagate the error.
   * @param callback - A callback function that receives an error and returns a value of type TFinalOutput or void.
   * The callback can handle the error and return a value to recover from the error.
   * If the callback returns a value, that value will be returned as the result of the execute method.
   * If the callback throws an error, that error will be returned as the error result of the execute method.
   * If no catch callback is provided, errors will be propagated as is.
   * @returns The current VersionFlow instance, allowing for method chaining.
   * This allows you to set the catch callback and continue building the migration flow.
   * You can chain this method with other methods like add or build to configure the migration flow further
   * and handle errors gracefully.
   */
    VersionFlow.prototype.catch = function (callback) {
        __classPrivateFieldSet(this, _VersionFlow_catch, callback, "f");
        return this;
    };
    return VersionFlow;
}());
exports.VersionFlow = VersionFlow;
_VersionFlow_nodes = new WeakMap(), _VersionFlow_catch = new WeakMap();
