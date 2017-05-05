/*
 * Sourced from ngrx/example-app: https://github.com/ngrx/example-app/blob/master/src/app/util.ts
 */

/**
 * This function coerces a string into a string literal type.
 * Using tagged union types in TypeScript 2.0, this enables
 * powerful typechecking of our reducers.
 *
 * Since every action label passes through this function it
 * is a good place to ensure all of our action labels
 * are unique.
 */

let typeCache: { [label: string]: boolean } = {};
export function type<T>(label: T | ''): T {
  if (typeCache[<string> label]) {
    throw new Error(`Action type "${label}" is not unique"`);
  }

  typeCache[<string> label] = true;

  return label as T;
}

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
