import {IPoint} from '../../../game/pow-core/point';

export enum GamePositionFacing {
  WEST = 0,
  EAST = 1,
  SOUTH = 2,
  NORTH = 3
}

export interface GameState {
  /** Unique IDs of all the members of the party */
  readonly party: string[];
  /** Unique IDs of all the items that the party has */
  readonly inventory: string[];
  readonly battleCounter: number;
  readonly gold: number;
  readonly keyData: {
    [key: string]: any
  };
  /**
   * The current map this player is in
   */
  readonly map: string;

  /**
   * The point this player is at
   */
  readonly position: IPoint;

  /**
   * The position of the party ship in the world.
   */
  readonly shipPosition: IPoint;

  /**
   * The combat zone that the party is currently in
   */
  readonly combatZone: string;

  /**
   * The direction the party is facing.
   */
  readonly facing?: GamePositionFacing;

  /** The time at which this game state was last saved. */
  readonly ts?: number;
}
