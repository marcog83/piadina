import type { MigrationNode, SemverRange } from '../scheme-up.types';
import { FlowError, ERR_NO_ASSERT_FUNCTION } from './error-codes';

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
export class NodeBuilder<TInput=unknown, TOutput=unknown> {
  #version: SemverRange = '1.0.0';

  #semverRange: SemverRange = '~1.0.0';

  #migrate?: (input: TInput) => TOutput;

  #assert?: <T>(input: T) => void;

  /**
   * Sets the version for the migration node.
   * The version should follow semantic versioning.
   * Example: "1.0.0", "2.1.3", etc.
   * @param version - The version string to set for the migration node.
   * @returns The current instance of NodeBuilder for method chaining.
   */
  version(version: SemverRange): this {
    this.#version = version;

    return this;
  }

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
  semverRange(semverRange: SemverRange): this {
    this.#semverRange = semverRange;

    return this;
  }

  /**
 * Sets the migration function for the migration node.
 * The migration function is called when the migration is applied.
 * @param callback - The migration function to set for the migration node.
 * @returns The current instance of NodeBuilder for method chaining.
 */
  migrate(callback: (input: TInput) => TOutput): this {
    this.#migrate = callback;

    return this;
  }

  /**
 * Sets the assert function for the migration node.
 * The assert function is used to validate the input object against the expected schema.
 * It should throw an error if the input does not match the schema.
 * @param callback - The assert function to set for the migration node.
 * @returns The current instance of NodeBuilder for method chaining.
 */
  assert(callback: <T>(input: T) => void): this {
    this.#assert = callback;

    return this;
  }

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
  build(): MigrationNode<TInput, TOutput> {
    if (!this.#assert) {
      throw new FlowError(ERR_NO_ASSERT_FUNCTION, { version: this.#version });
    }

    return {
      version: this.#version,
      semverRange: this.#semverRange,
      assert: this.#assert,
      migrate: this.#migrate,
    };
  }
}
