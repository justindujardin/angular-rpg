import {Action} from '@ngrx/store';
import {type} from '../util';
import {CombatFixedEncounter, CombatRandomEncounter} from './combat.model';

export const CombatActionTypes = {
  FIXED_ENCOUNTER:          type('rpg/combat/fixed'),
  FIXED_ENCOUNTER_READY:    type('rpg/combat/fixed/ready'),
  FIXED_ENCOUNTER_VICTORY:  type('rpg/combat/fixed/victory'),
  FIXED_ENCOUNTER_DEFEAT:   type('rpg/combat/fixed/defeat'),
  RANDOM_ENCOUNTER:         type('rpg/combat/random'),
  RANDOM_ENCOUNTER_READY:   type('rpg/combat/random/ready'),
  RANDOM_ENCOUNTER_VICTORY: type('rpg/combat/random/victory'),
  RANDOM_ENCOUNTER_DEFEAT:  type('rpg/combat/random/defeat'),
};

//
// Fixed Encounter Actions
//

export class CombatFixedEncounterAction implements Action {
  type = CombatActionTypes.FIXED_ENCOUNTER;

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


export type CombatActions
  = CombatFixedEncounterAction
  | CombatFixedEncounterReadyAction
  | CombatFixedEncounterVictoryAction
  | CombatFixedEncounterDefeatAction
  | CombatRandomEncounterAction
  | CombatRandomEncounterReadyAction
  | CombatRandomEncounterVictoryAction
  | CombatRandomEncounterDefeatAction
