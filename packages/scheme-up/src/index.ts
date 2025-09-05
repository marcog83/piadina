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
export { VersionFlow } from './builders/version-flow';
export { NodeBuilder } from './builders/node-builder';
export { MigrationChain } from './builders/migration-chain';
export type {
  MigrationNode,
  SchemeResult,
  VersionedObject,
  SemverRange,
  ErrorSchemeResult,
  SemverVersion,
  SuccessSchemeResult,
  CatchCallback,
} from './scheme-up.types';

export {
  ERR_NODES_NOT_REGISTERED,
  ERR_UNSUPPORTED_VERSION,
  ERR_MISSING_VERSION,
  ERR_NO_MIGRATION_NODE_FOUND,
  ERR_UNKNOWN,
  ERR_NO_ASSERT_FUNCTION,
  FlowError,
  ERROR_MESSAGES,
  type ErrorCode,
} from './builders/error-codes';

/**
 * @ignore
 */
export const version: string = process.env.PACKAGE_VERSION ?? 'alpha';
