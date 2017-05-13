Redux Store Models
---

TODO: Overview (for now: ngrx/store + typescript + immutable.js records)

# [model].model.ts

The plainest representations of the types of modeled data. This is usually one or more Typescript
interfaces with readonly properties to define the types and shape of the data. 

A simple model might look like this:
```typescript
export interface Item {
  readonly name: string;
  readonly value: number;
}
```

These interfaces are what should be referenced in your UI components.

# [model].reducer.ts

The reducer file does a number of things:
 
## Define the shape
 
Like the `[model].model.ts` file, the reducer exports an interface that describes 
the entire shape of the sub-tree for this model. 

```typescript
export interface ItemState {
  items: Immutable.List<Item>;
}
```

## Define Records

Immutable records provide runtime error checking to ensure that when we pass an object of 
type Item to the store, that it does not include extra properties that are not specified on
the data model. The strongly typed records also magically generate get methods for all the
properties, so any immutable record objects can be cast to the plain `Item` model interface
and be used without every knowing that they're immutable records.

```typescript
import {TypedRecord} from 'typed-immutable-record';
/** @internal */
export interface ItemRecord extends TypedRecord<ItemRecord>, Item {
}
```
The record interface is only used in the reducer file, and also sometimes in the accompanying
spec tests. If you find yourself referencing the `ItemRecord` interface in your UI components,
you're doing it wrong. If you want to make changes to the `Item` submit an action and let the
reducer use the Record to accomplish the task.

In addition to the record type definition, we create a special factory function that can
be used to instantiate a new instance of the record type, given a set of default values to 
set for the record properties. This function is especially useful for deserializing the 
state tree, and writing unit tests where you need to create fake test objects to assert against.

```typescript
import {makeTypedFactory} from 'typed-immutable-record';
/** @internal */
const itemFactory = makeTypedFactory<Item, ItemRecord>({
  name: 'unnamed',
  value: 0
});
```

## Provide Deserialization

Each reducer is expected to export a convention based function for deserializing its
state tree from JSON. The functions are exported as `[reducer]FromJSON`, take in the reducer 
state, and return the same type, but with the proper immutable structures. For example, if 
you have an `itemReducer`:

```typescript
export function itemFromJSON(jsonObject: ItemState): ItemState {
  return {
    items: Immutable.List<Item>(jsonObject.items)
  };
}
```

## Implement the state reducer



