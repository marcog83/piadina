"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.ERROR_MESSAGES = exports.FlowError = exports.ERR_NO_ASSERT_FUNCTION = exports.ERR_UNKNOWN = exports.ERR_NO_MIGRATION_NODE_FOUND = exports.ERR_MISSING_VERSION = exports.ERR_UNSUPPORTED_VERSION = exports.ERR_NODES_NOT_REGISTERED = exports.MigrationChain = exports.NodeBuilder = exports.VersionFlow = void 0;
/**
 * @module API reference
 * @packageDocumentation
 * @categoryDescription Types
 * TypeScript type aliases and interfaces that define the shapes and contracts used by the SDK and its consumers.
 * @categoryDescription Functions
 * Top-level utility and domain functions intended for direct use (helpers, small pure utilities, request helpers).
 * @categoryDescription Providers
 * React provider components that inject SDK services, configuration, or auth into a component tree.
 * @categoryDescription Enums
 * Enumerated constants representing discrete sets of allowed values used across APIs and components.
 * @categoryDescription Builders
 * Builder-pattern helpers and classes for composing complex requests, queries, or configuration objects.
 * @categoryDescription Components
 * Reusable React UI components and kit building blocks (presentational and container components).
 * @categoryDescription Hooks
 * React hooks for data fetching, domain logic, local state and side-effect coordination.
 * @categoryDescription Contexts
 * React context objects and small utilities to create/consume shared state and services.
 * @categoryDescription Errors
 * Custom Error classes, typed error payloads and helpers used to standardize error handling across the SDK.
 */
var version_flow_1 = require("./builders/version-flow");
Object.defineProperty(exports, "VersionFlow", { enumerable: true, get: function () { return version_flow_1.VersionFlow; } });
var node_builder_1 = require("./builders/node-builder");
Object.defineProperty(exports, "NodeBuilder", { enumerable: true, get: function () { return node_builder_1.NodeBuilder; } });
var migration_chain_1 = require("./builders/migration-chain");
Object.defineProperty(exports, "MigrationChain", { enumerable: true, get: function () { return migration_chain_1.MigrationChain; } });
var error_codes_1 = require("./builders/error-codes");
Object.defineProperty(exports, "ERR_NODES_NOT_REGISTERED", { enumerable: true, get: function () { return error_codes_1.ERR_NODES_NOT_REGISTERED; } });
Object.defineProperty(exports, "ERR_UNSUPPORTED_VERSION", { enumerable: true, get: function () { return error_codes_1.ERR_UNSUPPORTED_VERSION; } });
Object.defineProperty(exports, "ERR_MISSING_VERSION", { enumerable: true, get: function () { return error_codes_1.ERR_MISSING_VERSION; } });
Object.defineProperty(exports, "ERR_NO_MIGRATION_NODE_FOUND", { enumerable: true, get: function () { return error_codes_1.ERR_NO_MIGRATION_NODE_FOUND; } });
Object.defineProperty(exports, "ERR_UNKNOWN", { enumerable: true, get: function () { return error_codes_1.ERR_UNKNOWN; } });
Object.defineProperty(exports, "ERR_NO_ASSERT_FUNCTION", { enumerable: true, get: function () { return error_codes_1.ERR_NO_ASSERT_FUNCTION; } });
Object.defineProperty(exports, "FlowError", { enumerable: true, get: function () { return error_codes_1.FlowError; } });
Object.defineProperty(exports, "ERROR_MESSAGES", { enumerable: true, get: function () { return error_codes_1.ERROR_MESSAGES; } });
/**
 * @ignore
 */
exports.version = (_a = process.env.PACKAGE_VERSION) !== null && _a !== void 0 ? _a : 'alpha';
