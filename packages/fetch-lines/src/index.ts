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

import fetchJSONL from '@/api/fetch-json-lines';

export { type FetchJSONLOptions, FetchJSONL, createInstance } from '@/api/fetch-json-lines';
export { LinesTransformer } from '@/api/lines-transformer';

export default fetchJSONL;

/**
 * @ignore
 */
export const version: string = process.env.PACKAGE_VERSION ?? 'alpha';
