import {IPoint} from '../../../game/pow-core/point';
import * as Immutable from 'immutable';

export enum GamePositionFacing {
  WEST = 0,
  EAST = 1,
  SOUTH = 2,
  NORTH = 3
}

export interface GameState {
  /** Unique IDs of all the members of the party */
  readonly party: Immutable.List<string>;
  /** Unique IDs of all the items that the party has */
  readonly inventory: Immutable.List<string>;
  readonly battleCounter: number;
  readonly gold: number;
  readonly keyData: Immutable.Map<string, any>;
  /**
   * The current map this player is in
   */
  readonly location: string;

  /**
   * The point this player is at
   */
  readonly position: IPoint;

  /**
   * True when the party is onboard the ship
   */
  readonly boardedShip: boolean;

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
