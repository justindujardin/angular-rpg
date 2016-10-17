import {IPoint} from '../../../game/pow-core/point';
import {PartyMember} from '../party-member.model';
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

  /** The time at which this game state was last saved. */
  readonly ts?:number;
}
