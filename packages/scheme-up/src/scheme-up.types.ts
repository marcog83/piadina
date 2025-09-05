import { FlowError } from '@builders/error-codes';

/**
 * Type for the version in semantic versioning format.
 * It consists of three numeric components: major, minor, and patch.
 * Example: "1.0.0", "2.1.3", etc.
 * @category Types
 */
export type SemverVersion = `${ number }.${ number }.${ number }`;

/**
 * CatchCallback is a type for a function that handles errors.
 * It takes an optional error parameter and returns void or a value of type T to recover the failure.
 *
 * @category Types
 */
export type CatchCallback<T> = (error?: unknown) => T | void;

/**
 * Type for a semver range, which can be a specific version, or a range like `^1.0.0`, `~1.0.0`, etc.
 * @category Types
 */
export type SemverRange =
  | SemverVersion
  | `^${ SemverVersion }` // Compatible within major version
  | `~${ SemverVersion }` // Compatible within minor version
  | `>=${ SemverVersion }` // Greater than or equal
  | `<=${ SemverVersion }` // Less than or equal
  | `>${ SemverVersion }` // Greater than
  | `<${ SemverVersion }`; // Less than

/**
 * Type for the migration node, which includes version, semver range, assert function, and an optional migrate function.
 * @category Types
 */
export type MigrationNode<TInput=unknown, TOutput=unknown> = {
  /**
   * Version of the migration node, following semantic versioning.
   * It specifies the version of the schema that this node applies to.
   * Example: "1.0.0", "2.1.3", etc.
   */
  version: SemverRange;
  /**
   * Semver range for the migration node, defining the versions it applies to.
   * Example: "^1.0.0", "~2.0.0", etc.
   */
  semverRange: SemverRange;
  /**
   * Assert function to validate the input object against the expected schema.
   * It should throw an error if the input does not match the schema.
   */
  assert: <T>(input: T) => void;
  /**
   * Optional migrate function to transform the input object to the next version.
   * It takes the input of type TInput and returns an output of type TOutput.
   */
  migrate?: (input: TInput) => TOutput;
};

/**
 * Type for a versioned object, which includes a version string.
 * It is used to represent objects that have a specific version associated with them.
 * @category Types
 */
export type VersionedObject = {} & Record<'version', string>;

/**
 * SuccessSchemeResult is a type that represents a successful result of a scheme operation.
 * It is a tuple with the first element as true and the second element as the result of type T.
 * @category Types
 */
export type SuccessSchemeResult<T> = readonly[ true, T ];

/**
 * ErrorSchemeResult is a type that represents an error result of a scheme operation.
 * It is a tuple with the first element as false and the second element as an Error object.
 * @category Types
 */
export type ErrorSchemeResult = readonly[ false, FlowError ];

/**
 * SchemeResult is a union type that represents the result of a scheme operation.
 * It can either be a success with a value of type T or an error.
 * @category Types
 */
export type SchemeResult<T> = SuccessSchemeResult<T> | ErrorSchemeResult;
