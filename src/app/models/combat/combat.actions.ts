import { Action } from '@ngrx/store';
import { CombatantTypes, EntityStatuses, IEnemy, IPartyMember } from '../base-entity';
import { Item } from '../item';
import { IPartyStatsDiff } from '../mechanics';
import { type } from '../util';
import { CombatAttack, CombatEncounter, CombatType } from './combat.model';

export interface CombatVictorySummary {
  /** The encounter ID */
  id: string;
  /** The type of encounter */
  type: CombatType;
  /** The array of party members that survived the combat encounter */
  party: IPartyMember[];
  /** The list of enemies that were in the encounter */
  enemies: IEnemy[];
  /** Party members that leveled up */
  levels: IPartyStatsDiff[];
  /** Items collected during combat */
  items?: Item[];
  /** Items collected during combat */
  gold: number;
  /** Total experience from the encounter */
  exp: number;
}

//
// Fixed Encounter Actions
//

export class CombatEncounterAction implements Action {
  static typeId: 'COMBAT_ENCOUNTER' = type('COMBAT_ENCOUNTER');
  type = CombatEncounterAction.typeId;

  constructor(public payload: CombatEncounter) {}
}

export class CombatEncounterErrorAction implements Action {
  static typeId: 'COMBAT_ENCOUNTER_ERROR' = type('COMBAT_ENCOUNTER_ERROR');
  type = CombatEncounterErrorAction.typeId;

  constructor(public payload: CombatEncounter) {}
}

export class CombatEncounterReadyAction implements Action {
  static typeId: 'COMBAT_ENCOUNTER_READY' = type('COMBAT_ENCOUNTER_READY');
  readonly type = CombatEncounterReadyAction.typeId;

  constructor(public payload: CombatEncounter) {}
}

//
// Attack Actions
//

export class CombatAttackAction implements Action {
  static typeId: 'COMBAT_ATTACK' = type('COMBAT_ATTACK');
  readonly type = CombatAttackAction.typeId;

  constructor(public payload: CombatAttack) {}
}

export interface ICombatStatusPayload {
  classes: EntityStatuses[];
  target: CombatantTypes;
}

/** Add the given list of statuses to the target */
export class CombatSetStatusAction implements Action {
  static typeId: 'COMBAT_SET_STATUS' = type('COMBAT_SET_STATUS');
  readonly type = CombatSetStatusAction.typeId;

  constructor(public payload: ICombatStatusPayload) {}
}

/** Clear the given list of statuses from the target */
export class CombatClearStatusAction implements Action {
  static typeId: 'COMBAT_CLEAR_STATUS' = type('COMBAT_CLEAR_STATUS');
  readonly type = CombatClearStatusAction.typeId;

  constructor(public payload: ICombatStatusPayload) {}
}

/** Async event that notifies the user of combat victory and updates the game-state party tree. */
export class CombatEscapeAction implements Action {
  static typeId: 'COMBAT_ESCAPE' = type('COMBAT_ESCAPE');
  readonly type = CombatEscapeAction.typeId;
}

/** Dispatched after UI animation side-effects are complete */
export class CombatEscapeCompleteAction implements Action {
  static typeId: 'COMBAT_ESCAPE_DONE' = type('COMBAT_ESCAPE_DONE');
  type = CombatEscapeCompleteAction.typeId;
}

/** Async event that notifies the user of combat victory and updates the game-state party tree. */
export class CombatVictoryAction implements Action {
  static typeId: 'COMBAT_VICTORY' = type('COMBAT_VICTORY');
  readonly type = CombatVictoryAction.typeId;

  constructor(public payload: CombatVictorySummary) {}
}

/** Dispatched after UI animation side-effects are complete */
export class CombatVictoryCompleteAction implements Action {
  static typeId: 'COMBAT_VICTORY_DONE' = type('COMBAT_VICTORY_DONE');
  type = CombatVictoryCompleteAction.typeId;

  constructor(public payload: CombatVictorySummary) {}
}

export type CombatActions =
  | CombatEncounterAction
  | CombatEncounterReadyAction
  | CombatAttackAction
  | CombatSetStatusAction
  | CombatClearStatusAction
  | CombatEscapeAction
  | CombatEscapeCompleteAction
  | CombatVictoryAction
  | CombatVictoryCompleteAction;
