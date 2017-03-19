/**
 * Most basic entity only has an `eid` unique identifier for indexing.
 */
export interface EntityObject {
  eid: string;
}

/** Basic model for a life form */
export interface BaseEntity extends EntityObject {
  /** User readable name */
  readonly name?: string;
  /** Icon to render the entity with */
  readonly icon: string;
  /** The entity level */
  readonly level: number;
  /** Current magic points */
  readonly mp: number;
  /** Maximum magic points */
  readonly maxmp: number;
  /** Current health points */
  readonly hp: number;
  /** Maximum health points */
  readonly maxhp: number;
  /** Attack strength */
  readonly attack: number;
  /** Defense effectiveness */
  readonly defense: number;
  /** Magic strength */
  readonly magic: number;
  /** Agility/Dexterity */
  readonly speed: number;
}

/** Describe a collection of entities of a single type */
export interface EntityCollection<T> {
  byId: {
    [uniqueId: string]: T
  };
  allIds: string[];
}

/** Collection of {@see BaseEntity} objects. */
export type BaseEntityCollection = EntityCollection<BaseEntity>;
