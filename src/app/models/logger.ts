import * as Immutable from 'immutable';

/**
 * Possible types for values that need to be lazily evaluated
 */
type DeferredValueTypes = Immutable.List<any> | Immutable.Map<string, any> | any;

/**
 * Wrapper class that will serialize the state tree for viewing, but not until you
 * click on the value in chrome console logs. This is much faster with large state trees
 * than serializing when the entries are printed to the console.
 */
class DeferredValue {
  private _lazy: Function;

  get value() {
    return this._lazy();
  }

  constructor(value: DeferredValueTypes) {
    // If it's immutable, toJS it once, and cache the value
    if (!Immutable.Map.isMap(value) || Immutable.List.isList(value)) {
      let cached: any;
      this._lazy = () => {
        return cached || (cached = value.toJS());
      };
    } else {
      this._lazy = () => value;
    }
  }
}
