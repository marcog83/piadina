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
var _MigrationChain_nodes;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationChain = void 0;
var semver_1 = require("semver");
var error_codes_1 = require("./error-codes");
/**
 * MigrationChain is a class that allows you to apply a series of migrations to a versioned object.
 * It provides a method to upgrade the object to the latest version by applying the migrations defined in the nodes.
 * The migration nodes are defined using the MigrationNode type, which includes version,
 * semver range, assert function, and an optional migrate function.
 * The MigrationChain can be used to upgrade a versioned object to the latest version
 * by applying the migrations defined in the nodes.
 * It supports error handling through a catch callback.
 * @template TFinalOutput - The type of the final output after all migrations are applied.
 * @category Builders
 */
var MigrationChain = /** @class */ (function () {
    function MigrationChain(nodes) {
        _MigrationChain_nodes.set(this, []);
        __classPrivateFieldSet(this, _MigrationChain_nodes, nodes, "f");
    }
    /**
   *
   * @param input VersionedObject - The input object to upgrade.
   * @throws Error if the input version is invalid or unsupported.
   * @returns SchemeResult<TFinalOutput> - The result of the migration process.
   * It returns a tuple where the first element is a boolean indicating success,
   * and the second element is either the migrated object or an error.
   * If the migration is successful,
   * the first element will be true and the second element will be the migrated object of type TFinalOutput.
   * If an error occurs, the first element will be false and the second element will be an Error object.
   * This allows the caller to handle both successful migrations and errors in a consistent way.
   * The input object should have a 'version' property that matches one of the semver ranges
   * defined in the migration nodes.
   * The migration nodes are applied in order, starting from the first node that matches the input version.
   * Each node's assert function is called to validate the input object,
   * and if it passes, the migrate function is called to transform the input object to the next version.
   * The process continues until all applicable migration nodes have been applied
   * or until the latest version is reached.
   * If the input object does not match any of the semver ranges defined in the migration nodes,
   * an error will be thrown indicating that the version is unsupported.
   * If the input object is missing the 'version' property or if it is not a valid semver version string,
   * an error will also be thrown indicating that the version is missing or invalid.
   * If no migration nodes are available, an error will be thrown indicating that there are no migration nodes available.
   * If the final node does not assert the migrated object, an error will be thrown
   * indicating that no migration node was found.
   * This ensures that the migration process is robust and that the input object is properly validated
   * before being migrated to the latest version.
   */
    MigrationChain.prototype.upgradeToLatest = function (input) {
        var _a, _b;
        try {
            var version_1 = input.version;
            if (!version_1 || typeof version_1 !== 'string') {
                throw new error_codes_1.FlowError(error_codes_1.ERR_MISSING_VERSION, { version: version_1 });
            }
            if (__classPrivateFieldGet(this, _MigrationChain_nodes, "f").length === 0) {
                throw new error_codes_1.FlowError(error_codes_1.ERR_NODES_NOT_REGISTERED);
            }
            var startIndex = __classPrivateFieldGet(this, _MigrationChain_nodes, "f").findIndex(function (node) { return (0, semver_1.satisfies)(version_1, node.semverRange); });
            if (startIndex === -1) {
                throw new error_codes_1.FlowError(error_codes_1.ERR_UNSUPPORTED_VERSION, { version: version_1 });
            }
            var current = input;
            // Apply migrations from startIndex to end
            for (var i = startIndex; i < __classPrivateFieldGet(this, _MigrationChain_nodes, "f").length; i += 1) {
                var node = __classPrivateFieldGet(this, _MigrationChain_nodes, "f")[i];
                if (!node) {
                    throw new error_codes_1.FlowError(error_codes_1.ERR_NO_MIGRATION_NODE_FOUND);
                }
                node.assert(current);
                current = (_b = (_a = node.migrate) === null || _a === void 0 ? void 0 : _a.call(node, current)) !== null && _b !== void 0 ? _b : current;
            }
            var finalNode = __classPrivateFieldGet(this, _MigrationChain_nodes, "f").at(-1);
            if (!finalNode) {
                throw new error_codes_1.FlowError(error_codes_1.ERR_NO_MIGRATION_NODE_FOUND);
            }
            finalNode.assert(current);
            return [true, current];
        }
        catch (error) {
            return [
                false,
                error_codes_1.FlowError.from(error),
            ];
        }
    };
    return MigrationChain;
}());
exports.MigrationChain = MigrationChain;
_MigrationChain_nodes = new WeakMap();
