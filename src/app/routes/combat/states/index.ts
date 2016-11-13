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
import {CombatBeginTurnState} from './combat-begin-turn.state';
import {CombatChooseActionState} from './combat-choose-action.state';
import {CombatDefeatState} from './combat-defeat.state';
import {CombatEndTurnState} from './combat-end-turn.state';
import {CombatEscapeState} from './combat-escape.state';
import {CombatStartState} from './combat-start.state';
import {CombatVictoryState} from './combat-victory.state';
import {CombatStateMachine} from './combat.machine';
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
  CombatStateMachine,
  CombatBeginTurnState,
  CombatChooseActionState,
  CombatDefeatState,
  CombatEndTurnState,
  CombatEscapeState,
  CombatStartState,
  CombatVictoryState
];
