/*
 Copyright (C) 2013-2020 by Justin DuJardin and Contributors

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
// State Interfaces
// -------------------------------------------------------------------------
import { IStateMachine } from './state-machine';

export interface IState<TStateNames extends string> {
  name: TStateNames;
  enter(machine: IStateMachine<TStateNames>): void;
  exit(machine: IStateMachine<TStateNames>): void;
  update(machine: IStateMachine<TStateNames>): void;
}

export interface IStateTransition<TStateTransitionNames extends string> {
  targetState: TStateTransitionNames;
  evaluate(machine: IStateMachine<TStateTransitionNames>): boolean;
}

// Implementation
// -------------------------------------------------------------------------
export class State<T extends string> implements IState<T> {
  name: T;
  transitions: IStateTransition<T>[] = [];

  enter(machine: IStateMachine<T>) {
    // nothing
  }

  exit(machine: IStateMachine<T>) {
    // nothing
  }

  update(machine: IStateMachine<T>) {
    const l: number = this.transitions.length;
    for (let i: number = 0; i < l; i++) {
      const t: IStateTransition<T> = this.transitions[i];
      if (!t.evaluate(machine)) {
        continue;
      }
      if (!machine.setCurrentState(t.targetState)) {
        continue;
      }
      return;
    }
  }
}

export class StateTransition<TTransitionNames extends string>
  implements IStateTransition<TTransitionNames>
{
  targetState: TTransitionNames;

  evaluate(machine: IStateMachine<TTransitionNames>): boolean {
    return true;
  }
}
