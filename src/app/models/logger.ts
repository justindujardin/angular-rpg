import * as Immutable from 'immutable';
import {storeLogger} from 'ngrx-store-logger';

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
      let cached;
      this._lazy = () => {
        return cached || (cached = value.toJS());
      };
    }
    else {
      this._lazy = () => value;
    }
  }
}

/**
 * Logger middleware that plays nice with the large RPG data state tree.
 */
export const rpgLogger = storeLogger({
  collapsed: true,
  stateTransformer: (state: any) => {
    // This is called for actions and for meta entries with timing data. Ignore those.
    if (state.action && state.nextState) {
      return state;
    }
    // Immutable objects are not very easy to navigate in the console, so we lazily convert
    // them toJS for inspection. This makes sure the logger doesn't bog down the app with
    // large state trees.
    const result = {};
    Object.keys(state).forEach((k: string) => {
      result[k] = new DeferredValue(state[k]);
    });
    return result;
  }
});
