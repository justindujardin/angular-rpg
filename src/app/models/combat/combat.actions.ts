import {Action} from '@ngrx/store';
import {type} from '../util';
import {CombatFixedEncounter, CombatRandomEncounter, CombatAttack} from './combat.model';

export const CombatActionTypes = {
  FIXED_ENCOUNTER: type('rpg/combat/fixed'),
  FIXED_ENCOUNTER_READY: type('rpg/combat/fixed/ready'),
  FIXED_ENCOUNTER_ERROR: type('rpg/combat/fixed/error'),
  FIXED_ENCOUNTER_VICTORY: type('rpg/combat/fixed/victory'),
  FIXED_ENCOUNTER_DEFEAT: type('rpg/combat/fixed/defeat'),
  RANDOM_ENCOUNTER: type('rpg/combat/random'),
  RANDOM_ENCOUNTER_READY: type('rpg/combat/random/ready'),
  RANDOM_ENCOUNTER_ERROR: type('rpg/combat/random/error'),
  RANDOM_ENCOUNTER_VICTORY: type('rpg/combat/random/victory'),
  RANDOM_ENCOUNTER_DEFEAT: type('rpg/combat/random/defeat'),
  ACTION_ATTACK: type('rpg/combat/attack'),
  ACTION_ATTACK_HIT: type('rpg/combat/attack/hit'),
  ACTION_ATTACK_MISS: type('rpg/combat/attack/miss'),
  ACTION_GUARD: type('rpg/combat/guard'),
  ACTION_GUARD_HIT: type('rpg/combat/guard/hit'),
  ACTION_GUARD_MISS: type('rpg/combat/guard/miss'),
  ACTION_MAGIC: type('rpg/combat/magic'),
  ACTION_MAGIC_HIT: type('rpg/combat/magic/hit'),
  ACTION_MAGIC_MISS: type('rpg/combat/magic/miss'),
  ACTION_ITEM: type('rpg/combat/item'),
  ACTION_ITEM_HIT: type('rpg/combat/item/hit'),
  ACTION_ITEM_MISS: type('rpg/combat/item/miss'),
  ACTION_RUN: type('rpg/combat/run'),
  ACTION_RUN_HIT: type('rpg/combat/run/hit'),
  ACTION_RUN_MISS: type('rpg/combat/run/miss'),
};

//
// Fixed Encounter Actions
//

export class CombatFixedEncounterAction implements Action {
  type = CombatActionTypes.FIXED_ENCOUNTER;

  constructor(public payload: CombatFixedEncounter) {
  }
}

export class CombatFixedEncounterErrorAction implements Action {
  type = CombatActionTypes.FIXED_ENCOUNTER_ERROR;

  constructor(public payload: CombatFixedEncounter) {
  }
}

export class CombatFixedEncounterReadyAction implements Action {
  type = CombatActionTypes.FIXED_ENCOUNTER_READY;

  constructor(public payload: CombatFixedEncounter) {
  }
}

export class CombatFixedEncounterVictoryAction implements Action {
  type = CombatActionTypes.FIXED_ENCOUNTER_VICTORY;

  constructor(public payload: CombatFixedEncounter) {
  }
}


export class CombatFixedEncounterDefeatAction implements Action {
  type = CombatActionTypes.FIXED_ENCOUNTER_DEFEAT;

  constructor(public payload: CombatFixedEncounter) {
  }
}

//
// Random Encounter Actions
//

export class CombatRandomEncounterAction implements Action {
  type = CombatActionTypes.RANDOM_ENCOUNTER;

  constructor(public payload: CombatRandomEncounter) {
  }
}

export class CombatRandomEncounterErrorAction implements Action {
  type = CombatActionTypes.RANDOM_ENCOUNTER_ERROR;

  constructor(public payload: CombatRandomEncounter) {
  }
}

export class CombatRandomEncounterReadyAction implements Action {
  type = CombatActionTypes.RANDOM_ENCOUNTER_READY;

  constructor(public payload: CombatRandomEncounter) {
  }
}


export class CombatRandomEncounterVictoryAction implements Action {
  type = CombatActionTypes.RANDOM_ENCOUNTER_VICTORY;

  constructor(public payload: CombatRandomEncounter) {
  }
}


export class CombatRandomEncounterDefeatAction implements Action {
  type = CombatActionTypes.RANDOM_ENCOUNTER_DEFEAT;

  constructor(public payload: CombatRandomEncounter) {
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

export class CombatAttackHitAction implements Action {
  type = CombatActionTypes.ACTION_ATTACK_HIT;

  constructor(public payload: CombatAttack) {
  }
}

export class CombatAttackMissAction implements Action {
  type = CombatActionTypes.ACTION_ATTACK_MISS;

  constructor(public payload: CombatAttack) {
  }
}


export type CombatActions
  = CombatFixedEncounterAction
  | CombatFixedEncounterReadyAction
  | CombatFixedEncounterVictoryAction
  | CombatFixedEncounterDefeatAction
  | CombatRandomEncounterAction
  | CombatRandomEncounterReadyAction
  | CombatRandomEncounterVictoryAction
  | CombatRandomEncounterDefeatAction
  | CombatAttackAction
  | CombatAttackHitAction
  | CombatAttackMissAction
