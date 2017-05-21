import {Action} from '@ngrx/store';
import {type} from '../util';
import {Combatant, CombatAttack, CombatEncounter, CombatType} from './combat.model';
import {Entity} from '../entity/entity.model';
import {Item} from '../item';

export interface CombatVictorySummary {
  /** The encounter ID */
  id: string;
  /** The type of encounter */
  type: CombatType;
  /** The array of party members that survived the combat encounter */
  party: Entity[];
  /** The list of enemies that were in the encounter */
  enemies: Combatant[];
  /** Party members that leveled up */
  levels: Entity[];
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

  constructor(public payload: CombatEncounter) {
  }
}

export class CombatEncounterErrorAction implements Action {
  static typeId: 'COMBAT_ENCOUNTER_ERROR' = type('COMBAT_ENCOUNTER_ERROR');
  type = CombatEncounterErrorAction.typeId;

  constructor(public payload: CombatEncounter) {
  }
}

export class CombatEncounterReadyAction implements Action {
  static typeId: 'COMBAT_ENCOUNTER_READY' = type('COMBAT_ENCOUNTER_READY');
  readonly type = CombatEncounterReadyAction.typeId;

  constructor(public payload: CombatEncounter) {
  }
}

//
// Attack Actions
//

export class CombatAttackAction implements Action {
  static typeId: 'COMBAT_ATTACK' = type('COMBAT_ATTACK');
  readonly type = CombatAttackAction.typeId;

  constructor(public payload: CombatAttack) {
  }
}

/** Async event that notifies the user of combat victory and updates the game-state party tree. */
export class CombatVictoryAction implements Action {
  static typeId: 'COMBAT_VICTORY' = type('COMBAT_VICTORY');
  readonly type = CombatVictoryAction.typeId;

  constructor(public payload: CombatVictorySummary) {
  }
}

/** Dispatched after UI animation side-effects are complete */
export class CombatVictoryCompleteAction implements Action {
  static typeId: 'COMBAT_VICTORY_DONE' = type('COMBAT_VICTORY_DONE');
  type = CombatVictoryCompleteAction.typeId;

  constructor(public payload: CombatVictorySummary) {
  }
}

export type CombatActions
  = CombatEncounterAction
  | CombatEncounterReadyAction
  | CombatAttackAction
  | CombatVictoryAction
  | CombatVictoryCompleteAction;
