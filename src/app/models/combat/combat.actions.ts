import {Action} from '@ngrx/store';
import {type} from '../util';
import {Combatant, CombatAttack, CombatEncounter} from './combat.model';
import {Entity} from '../entity/entity.model';
import {Item} from '../item';

export interface CombatVictorySummary {
  party: Entity[];
  enemies: Combatant[];
  levels: Entity[];
  items?: Item[];
  gold: number;
  exp: number;
}

export const CombatActionTypes = {
  ENCOUNTER: type('rpg/combat/encounter'),
  ENCOUNTER_READY: type('rpg/combat/ready'),
  ENCOUNTER_ERROR: type('rpg/combat/error'),
  VICTORY: type('rpg/combat/victory/async'),
  VICTORY_COMPLETE: type('rpg/combat/victory/done'),
  ACTION_ATTACK: type('rpg/combat/attack')
};

//
// Fixed Encounter Actions
//

export class CombatEncounterAction implements Action {
  type = CombatActionTypes.ENCOUNTER;

  constructor(public payload: CombatEncounter) {
  }
}

export class CombatEncounterErrorAction implements Action {
  type = CombatActionTypes.ENCOUNTER_ERROR;

  constructor(public payload: CombatEncounter) {
  }
}

export class CombatEncounterReadyAction implements Action {
  type = CombatActionTypes.ENCOUNTER_READY;

  constructor(public payload: CombatEncounter) {
  }
}

//
// Attack Actions
//

export class CombatAttackAction implements Action {
  type = CombatActionTypes.ACTION_ATTACK;

  constructor(public payload: CombatAttack) {
  }
}

/** Async event that notifies the user of combat victory and updates the game-state party tree. */
export class CombatVictoryAction implements Action {
  type = CombatActionTypes.VICTORY;

  constructor(public payload: CombatVictorySummary) {
  }
}

/** Dispatched after UI animation side-effects are complete */
export class CombatVictoryCompleteAction implements Action {
  type = CombatActionTypes.VICTORY_COMPLETE;

  constructor(public payload: CombatVictorySummary) {
  }
}

export type CombatActions
  = CombatEncounterAction
  | CombatEncounterReadyAction
  | CombatAttackAction;
