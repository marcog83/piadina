import { satisfies } from 'semver';
import type { MigrationNode, SchemeResult, VersionedObject } from '../scheme-up.types';
import {
  ERR_NO_MIGRATION_NODE_FOUND,
  ERR_NODES_NOT_REGISTERED,
  ERR_UNSUPPORTED_VERSION,
  ERR_MISSING_VERSION,
  FlowError,
} from './error-codes';

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
export class MigrationChain<TFinalOutput> {
  #nodes: MigrationNode[] = [];

  constructor(nodes: MigrationNode[]) {
    this.#nodes = nodes;
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
  upgradeToLatest(input: VersionedObject): SchemeResult<TFinalOutput> {
    try {
      const { version } = input;

      if (!version || typeof version !== 'string') {
        throw new FlowError(ERR_MISSING_VERSION, { version });
      }

      if (this.#nodes.length === 0) {
        throw new FlowError(ERR_NODES_NOT_REGISTERED);
      }

      const startIndex = this.#nodes.findIndex((node) => satisfies(version, node.semverRange));

      if (startIndex === -1) {
        throw new FlowError(ERR_UNSUPPORTED_VERSION, { version });
      }

      let current = input;

      // Apply migrations from startIndex to end
      for (let i = startIndex; i < this.#nodes.length; i += 1) {
        const node = this.#nodes[i];
        if (!node) {
          throw new FlowError(ERR_NO_MIGRATION_NODE_FOUND);
        }
        node.assert(current);
        current = node.migrate?.(current) ?? current;
      }

      const finalNode = this.#nodes.at(-1);

      if (!finalNode) {
        throw new FlowError(ERR_NO_MIGRATION_NODE_FOUND);
      }
      finalNode.assert(current);

      return [ true, current as TFinalOutput ] as const;
    } catch (error) {
      return [
        false,
        FlowError.from(error),
      ] as const;
    }
  }
}
