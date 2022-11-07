import { ElementRef } from '@angular/core';
import { Point } from '../../core';
import { NamedMouseElement } from '../../core/input';
import { GameEntityObject } from '../../scene/objects/game-entity-object';

/**
 * Describe a selectable menu item for a user input in combat.
 */
export interface ICombatMenuItem {
  select(): any;
  label: string;
  id: string;
  source?: GameEntityObject;
}

export interface ICombatDamageSummary {
  id: string;
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
  act(): Promise<boolean>;
}

/**
 * Attach an HTML element to the position of a game object.
 */
export interface UIAttachment {
  object: GameEntityObject;
  offset: Point;
  element: ElementRef;
}

/** The user clicked on the combat scene */
export interface CombatSceneClick {
  /** The mouse information */
  mouse: NamedMouseElement;
  /** The scene objects under the mouse */
  hits: GameEntityObject[];
}
