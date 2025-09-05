/**
 * Nodes not registered error code.
 * This error is thrown when no nodes are registered in the `VersionFlow`.
 * It indicates that the validation process cannot proceed because there are no nodes to validate against.
 * @category Enums
 */
export const ERR_NODES_NOT_REGISTERED = 'FLOW-0001' as const;
/**
 * Unsupported version error code.
 * This error is thrown when the input version does not match any of the semver ranges defined in the nodes.
 * It indicates that the input object cannot be validated because its version is not supported by the version flow.
 * @category Enums
 */
export const ERR_UNSUPPORTED_VERSION = 'FLOW-0002' as const;
/**
 * Missing version error code.
 * This error is thrown when the input object does not have a 'version' property
 * or if the version is not a valid semver version string.
 * It indicates that the input object cannot be validated because it lacks the necessary version information.
 * @category Enums
 */
export const ERR_MISSING_VERSION = 'FLOW-0003' as const;

/**
 * No migration node found error code.
 * This error is thrown when no migration node is found in the version flow.
 * It indicates that the validation process cannot proceed because there are no nodes to validate against.
 * @category Enums
 */
export const ERR_NO_MIGRATION_NODE_FOUND = 'FLOW-0004' as const;

/**
 * Unknown error code.
 * This error is thrown when an unexpected error occurs during the validation process.
 * It indicates that the validation process encountered an error that was not anticipated.
 * @category Enums
 */
export const ERR_UNKNOWN = 'FLOW-0005' as const;
/**
 * No assert function error code.
 * This error is thrown when the assert function is not set when building the validation node.
 * It indicates that the node is incomplete and cannot be used in the validation process.
 * The assert function is essential for validating the input object against the expected schema.
 * If the assert function is not provided, an error will be thrown when building the node.
 * @category Enums
 */
export const ERR_NO_ASSERT_FUNCTION = 'FLOW-0006' as const;

/**
 * Error code type.
 * This type represents the possible error codes that can be thrown by the validation process.
 * @category Types
 */
export type ErrorCode =
  | typeof ERR_NODES_NOT_REGISTERED
  | typeof ERR_UNSUPPORTED_VERSION
  | typeof ERR_MISSING_VERSION
  | typeof ERR_NO_MIGRATION_NODE_FOUND
  | typeof ERR_UNKNOWN
  | typeof ERR_NO_ASSERT_FUNCTION;

/**
 * Error messages for the error codes.
 * This object maps each error code to a human-readable error message.
 * These messages are used to provide context when an error occurs during the validation process.
 * @category Enums
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERR_NODES_NOT_REGISTERED]: 'No nodes are registered in the VersionFlow.',
  [ERR_UNSUPPORTED_VERSION]: 'Unsupported input version.',
  [ERR_MISSING_VERSION]: 'Missing or invalid version in input object.',
  [ERR_NO_MIGRATION_NODE_FOUND]: 'No migration node found.',
  [ERR_UNKNOWN]: 'Unknown error during validation.',
  [ERR_NO_ASSERT_FUNCTION]: 'No assert function provided for validation node.',
};

/**
 * FlowError class.
 * This class extends the built-in Error class to provide a custom error type for the validation process.
 * It includes an error code and optional data to provide additional context about the error.
 * The error code is one of the predefined error codes, and the data can include any relevant information
 * that can help diagnose the issue.
 * @category Builders
 * @example
 * ```typescript
 * import { FlowError, ERR_NO_ASSERT_FUNCTION } from 'scheme-up';
 *
 * throw new FlowError(ERR_NO_ASSERT_FUNCTION, { version: '1.0.0' });
 * ```
 * This example shows how to create a FlowError with a specific error code and additional data.
 * The FlowError can be caught and handled in the application to provide a better user experience
 * or to log the error for debugging purposes.
 * @extends Error
 * @property {ErrorCode} code - The error code associated with the error.
 * @property {Record<PropertyKey, any>} data - Additional data related to the error.
 * This data can include any relevant information that can help diagnose the issue.
 *
 * @category Errors
 */
export class FlowError extends Error {
  override public cause: {
    code: ErrorCode;
    data?: string | Record<PropertyKey, unknown>;
  };

  constructor(code: ErrorCode, data?: Record<PropertyKey, unknown>) {
    super(ERROR_MESSAGES[code]);
    this.cause = {
      code,
      data,
    };
    this.name = 'FlowError';
  }

  /**
   * Creates a FlowError from an existing error, or converts an object to a FlowError.
   * This method is useful for converting errors that may not be instances of FlowError
   * into a consistent FlowError format.
   * @param err - The error, or object to convert into a FlowError.
   * @returns A FlowError instance.
   */
  static from(err: unknown): FlowError {
    if (err instanceof FlowError) {
      return err;
    }

    if (err instanceof Error) {
      const code = (err.cause as FlowError['cause'])?.code ?? ERR_UNKNOWN;
      const message = ERROR_MESSAGES[code] ?? ERROR_MESSAGES[ERR_UNKNOWN];
      const flowError = new FlowError(code);
      const data = (err.cause as FlowError['cause'])?.data ?? err.message ?? message;

      flowError.message = message;
      flowError.cause = {
        code,
        data,
      };
      flowError.stack = err.stack ;

      return flowError;
    }

    return new FlowError(ERR_UNKNOWN, err as Record<PropertyKey, unknown>);
  }
}
