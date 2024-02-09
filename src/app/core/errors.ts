/**
 * Constant strings for use in throwing Error with messages.  Used to
 * make checking thrown errors doable without an explosion of Error subclasses.
 */
export const errors = {
  /**
   * An invalid combination of arguments was given to a function
   */
  INVALID_ARGUMENTS: 'invalid arguments',

  /**
   * A division by zero would have occurred
   */
  DIVIDE_ZERO: 'divide by zero operation',

  /**
   * Something called on a base class that doesn't implement the desired functionality
   */
  CLASS_NOT_IMPLEMENTED: 'must be implemented in a subclass',

  /**
   * The operation is not supported by the implementation.
   */
  UNSUPPORTED_OPERATION: 'this operation is unsupported by the implementation',

  REQUIRED_ARGUMENT: 'argument must be valid',

  ALREADY_EXISTS: 'already exists and would overwrite existing value',

  /**
   * A specified index is out of the valid range for an array it applies to.
   */
  INDEX_OUT_OF_RANGE: 'index out of range',

  /**
   * An item is not of the expected type or value.
   */
  INVALID_ITEM: 'invalid item type or value',

  /**
   * A component failed to register.
   */
  COMPONENT_REGISTER_FAIL: 'component failed to register with host entity',
};
