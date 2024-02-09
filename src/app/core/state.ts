// State Interfaces
// -------------------------------------------------------------------------

import { StateMachine } from './state-machine';

export interface IStateTransition<TStateTransitionNames extends string> {
  targetState: TStateTransitionNames;
  evaluate(machine: StateMachine<TStateTransitionNames>): boolean;
}

// Implementation
// -------------------------------------------------------------------------
export class State<T extends string> {
  name: T;
  transitions: IStateTransition<T>[] = [];

  async enter(machine: StateMachine<T>) {
    // nothing
  }

  async exit(machine: StateMachine<T>) {
    // nothing
  }

  async update(machine: StateMachine<T>) {
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

  evaluate(machine: StateMachine<TTransitionNames>): boolean {
    return true;
  }
}
