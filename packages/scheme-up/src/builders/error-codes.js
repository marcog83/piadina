"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowError = exports.ERROR_MESSAGES = exports.ERR_NO_ASSERT_FUNCTION = exports.ERR_UNKNOWN = exports.ERR_NO_MIGRATION_NODE_FOUND = exports.ERR_MISSING_VERSION = exports.ERR_UNSUPPORTED_VERSION = exports.ERR_NODES_NOT_REGISTERED = void 0;
/**
 * Nodes not registered error code.
 * This error is thrown when no nodes are registered in the `VersionFlow`.
 * It indicates that the validation process cannot proceed because there are no nodes to validate against.
 * @category Enums
 */
exports.ERR_NODES_NOT_REGISTERED = 'FLOW-0001';
/**
 * Unsupported version error code.
 * This error is thrown when the input version does not match any of the semver ranges defined in the nodes.
 * It indicates that the input object cannot be validated because its version is not supported by the version flow.
 * @category Enums
 */
exports.ERR_UNSUPPORTED_VERSION = 'FLOW-0002';
/**
 * Missing version error code.
 * This error is thrown when the input object does not have a 'version' property
 * or if the version is not a valid semver version string.
 * It indicates that the input object cannot be validated because it lacks the necessary version information.
 * @category Enums
 */
exports.ERR_MISSING_VERSION = 'FLOW-0003';
/**
 * No migration node found error code.
 * This error is thrown when no migration node is found in the version flow.
 * It indicates that the validation process cannot proceed because there are no nodes to validate against.
 * @category Enums
 */
exports.ERR_NO_MIGRATION_NODE_FOUND = 'FLOW-0004';
/**
 * Unknown error code.
 * This error is thrown when an unexpected error occurs during the validation process.
 * It indicates that the validation process encountered an error that was not anticipated.
 * @category Enums
 */
exports.ERR_UNKNOWN = 'FLOW-0005';
/**
 * No assert function error code.
 * This error is thrown when the assert function is not set when building the validation node.
 * It indicates that the node is incomplete and cannot be used in the validation process.
 * The assert function is essential for validating the input object against the expected schema.
 * If the assert function is not provided, an error will be thrown when building the node.
 * @category Enums
 */
exports.ERR_NO_ASSERT_FUNCTION = 'FLOW-0006';
/**
 * Error messages for the error codes.
 * This object maps each error code to a human-readable error message.
 * These messages are used to provide context when an error occurs during the validation process.
 * @category Enums
 */
exports.ERROR_MESSAGES = (_a = {},
    _a[exports.ERR_NODES_NOT_REGISTERED] = 'No nodes are registered in the VersionFlow.',
    _a[exports.ERR_UNSUPPORTED_VERSION] = 'Unsupported input version.',
    _a[exports.ERR_MISSING_VERSION] = 'Missing or invalid version in input object.',
    _a[exports.ERR_NO_MIGRATION_NODE_FOUND] = 'No migration node found.',
    _a[exports.ERR_UNKNOWN] = 'Unknown error during validation.',
    _a[exports.ERR_NO_ASSERT_FUNCTION] = 'No assert function provided for validation node.',
    _a);
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
var FlowError = /** @class */ (function (_super) {
    __extends(FlowError, _super);
    function FlowError(code, data) {
        var _this = _super.call(this, exports.ERROR_MESSAGES[code]) || this;
        _this.cause = {
            code: code,
            data: data,
        };
        _this.name = 'FlowError';
        return _this;
    }
    /**
     * Creates a FlowError from an existing error, or converts an object to a FlowError.
     * This method is useful for converting errors that may not be instances of FlowError
     * into a consistent FlowError format.
     * @param err - The error, or object to convert into a FlowError.
     * @returns A FlowError instance.
     */
    FlowError.from = function (err) {
        var _a, _b, _c, _d, _e, _f;
        if (err instanceof FlowError) {
            return err;
        }
        if (err instanceof Error) {
            var code = (_b = (_a = err.cause) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : exports.ERR_UNKNOWN;
            var message = (_c = exports.ERROR_MESSAGES[code]) !== null && _c !== void 0 ? _c : exports.ERROR_MESSAGES[exports.ERR_UNKNOWN];
            var flowError = new FlowError(code);
            var data = (_f = (_e = (_d = err.cause) === null || _d === void 0 ? void 0 : _d.data) !== null && _e !== void 0 ? _e : err.message) !== null && _f !== void 0 ? _f : message;
            flowError.message = message;
            flowError.cause = {
                code: code,
                data: data,
            };
            flowError.stack = err.stack;
            return flowError;
        }
        return new FlowError(exports.ERR_UNKNOWN, err);
    };
    return FlowError;
}(Error));
exports.FlowError = FlowError;
