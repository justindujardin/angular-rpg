
import { CombatBeginTurnStateComponent } from './combat-begin-turn.state';
import { CombatChooseActionStateComponent } from './combat-choose-action.state';
import { CombatDefeatStateComponent } from './combat-defeat.state';
import { CombatEndTurnStateComponent } from './combat-end-turn.state';
import { CombatEscapeStateComponent } from './combat-escape.state';
import { CombatStartStateComponent } from './combat-start.state';
import { CombatVictoryStateComponent } from './combat-victory.state';
import { CombatStateMachineComponent } from './combat.machine';
export * from './combat-base.state';
export * from './combat-begin-turn.state';
export * from './combat-choose-action.state';
export * from './combat-defeat.state';
export * from './combat-end-turn.state';
export * from './combat-escape.state';
export * from './combat-start.state';
export * from './combat-victory.state';
export * from './combat.machine';

export const COMBAT_STATE_COMPONENTS = [
  CombatStateMachineComponent,
  CombatBeginTurnStateComponent,
  CombatChooseActionStateComponent,
  CombatDefeatStateComponent,
  CombatEndTurnStateComponent,
  CombatEscapeStateComponent,
  CombatStartStateComponent,
  CombatVictoryStateComponent,
];
