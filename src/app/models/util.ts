/*
 * Sourced from ngrx/example-app: https://github.com/ngrx/example-app/blob/master/src/app/util.ts
 */

import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';
/**
 * This function coerces a string into a string literal type.
 * Using tagged union types in TypeScript 2.0, this enables
 * powerful typechecking of our reducers.
 *
 * Since every action label passes through this function it
 * is a good place to ensure all of our action labels
 * are unique.
 */

const typeCache: { [label: string]: boolean } = {};
export function type<T>(label: T | ''): T {
  if (typeCache[<string> label]) {
    throw new Error(`Action type "${label}" is not unique"`);
  }

  typeCache[<string> label] = true;

  return label as T;
}

/**
 * Helper for exhaustive switch checking using tagged union types
 * @param input The union type
 */
export function exhaustiveCheck(input: never) {
  // This function is compiler magic. Call it with the source of a switch(source) using a tagged union of
  // types, and it will throw a compiler error if a valid switch case from the union type is missing.
  // The error will include the type that is missing.
}

/**
 * {@see 'typed-immutable-record'/makeTypedFactory} but returns a factor function that accepts a Partial<E>
 *   as the init values argument.
 */
export function makeRecordFactory<E, T extends TypedRecord<T> & E>(obj: E, name?: string): (val?: Partial<E>) => T {
  return makeTypedFactory<E, T>(obj, name);
};

/**
 * Throw errors if the given expression is falsy
 */
export function assertTrue(expression: any, message: string) {
  if (!expression) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

/**
 * Generate probably unique IDs. See: http://stackoverflow.com/questions/26501688/a-typescript-guid-class
 * @returns {string}
 */
export function newGuid() {
  /* tslint:disable */
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  /* tslint:enable */
}
