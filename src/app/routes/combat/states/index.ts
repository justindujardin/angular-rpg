/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import {CombatBeginTurnStateComponent} from './combat-begin-turn.state';
import {CombatChooseActionStateComponent} from './combat-choose-action.state';
import {CombatDefeatStateComponent} from './combat-defeat.state';
import {CombatEndTurnStateComponent} from './combat-end-turn.state';
import {CombatEscapeStateComponent} from './combat-escape.state';
import {CombatStartStateComponent} from './combat-start.state';
import {CombatVictoryStateComponent} from './combat-victory.state';
import {CombatStateMachineComponent} from './combat.machine';
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
  CombatVictoryStateComponent
];
