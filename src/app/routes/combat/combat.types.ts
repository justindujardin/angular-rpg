import { Point } from '../../core';
import { ITemplateBaseItem } from '../../models/game-data/game-data.model';
import { GameEntityObject } from '../../scene/objects/game-entity-object';

/**
 * Describe a selectable menu item for a user input in combat.
 */
export interface ICombatMenuItem<T = GameEntityObject | ITemplateBaseItem> {
  select(): any;
  label: string;
  source: T;
}

export interface ICombatDamageSummary {
  timeout: number;
  value: number;
  classes: {
    miss: boolean;
    heal: boolean;
  };
  position: Point;
}

/** Description of a combat entity attack */
export interface CombatAttackSummary {
  damage: number;
  attacker: GameEntityObject;
  defender: GameEntityObject;
}
/**
 * Completion callback for a player action.
 */
export type IPlayerActionCallback = (action: IPlayerAction, error?: any) => void;
/**
 * A Player action during combat
 */
export interface IPlayerAction {
  name: string;
  from: GameEntityObject | null;
  to: GameEntityObject | null;
  act(then?: IPlayerActionCallback): boolean;
}
