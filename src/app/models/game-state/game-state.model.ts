import {IPoint} from '../../../game/pow-core/point';
import {PartyMember} from '../party-member.model';

export enum GamePositionFacing {
  WEST = 0,
  EAST = 1,
  SOUTH = 2,
  NORTH = 3
}

export interface GameState {
  readonly id?: number | string;
  readonly name?: string;
  readonly party: PartyMember[]; // The player's party
  readonly keyData: {
    [key: string]: any
  };
  readonly gold: number;
  readonly combatZone: string;
  /** The current map this player is in */
  readonly map: string;

  /** The point this player is at */
  readonly position: IPoint;

  readonly facing?: GamePositionFacing;

  /** The time at which this game state was last saved. */
  readonly ts?: number;
}
