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
// State Machine Interfaces
// -------------------------------------------------------------------------
import { EventEmitter } from '@angular/core';
import * as _ from 'underscore';
import { IState } from './state';

export interface IStateMachine<TStateMachineStateNames extends string> {
  update(data: any): void;
  addState(state: IState<TStateMachineStateNames>): void;
  addStates(states: IState<TStateMachineStateNames>[]): void;
  getCurrentState(): IState<TStateMachineStateNames> | null;
  getCurrentName(): TStateMachineStateNames | null;
  setCurrentStateObject(newState: IState<TStateMachineStateNames> | null): boolean;
  setCurrentState(name: TStateMachineStateNames): boolean;
  getPreviousState(): IState<TStateMachineStateNames> | null;
  getState(name: TStateMachineStateNames): IState<TStateMachineStateNames> | null;
}

export interface IResumeCallback {
  (): void;
}

/** A state change description */
export interface IStateChange<T extends string> {
  from: IState<T> | null;
  to: IState<T>;
}

// Implementation
// -------------------------------------------------------------------------
export class StateMachine<StateNames extends string>
  implements IStateMachine<StateNames>
{
  static DEBUG_STATES: boolean = true;

  defaultState: StateNames | null = null;
  states: IState<StateNames>[] = [];

  /** Emits when a new state has been entered */
  onEnterState$ = new EventEmitter<IStateChange<StateNames>>();
  /** Emits when an existing state is about to be exited */
  onExitState$ = new EventEmitter<IStateChange<StateNames>>();

  private _currentState: IState<StateNames> | null = null;
  private _previousState: IState<StateNames> | null = null;
  private _newState: boolean = false;
  private _pendingState: IState<StateNames> | null = null;

  update(data?: any) {
    this._newState = false;
    if (this._currentState === null) {
      this.setCurrentState(this.defaultState);
    }
    if (this._currentState !== null) {
      this._currentState.update(this);
    }
    // Didn't transition, make sure previous === current for next tick.
    if (this._newState === false && this._currentState !== null) {
      this._previousState = this._currentState;
    }
  }

  addState(state: IState<StateNames>): void {
    this.states.push(state);
  }

  addStates(states: IState<StateNames>[]): void {
    this.states = _.unique(this.states.concat(states));
  }

  getCurrentState(): IState<StateNames> | null {
    return this._currentState;
  }

  getCurrentName(): StateNames | null {
    return this._currentState !== null ? this._currentState.name : null;
  }

  /**
   * Set the current state after the callstack unwinds.
   * @param newState A state object
   */
  setCurrentStateObject(state: IState<StateNames> | null): boolean {
    if (!state) {
      console.error(`STATE NOT FOUND: ${state}`);
      return false;
    }
    if (!this._setCurrentState(state)) {
      console.error(`Failed to set state: ${state?.name}`);
    }
    return true;
  }
  /**
   * Set the current state by name after the callstack unwinds.
   * @param name A known state name
   */
  setCurrentState(name: StateNames | null): boolean {
    let state = this.getState(name);
    return this.setCurrentStateObject(state);
  }

  private _setCurrentState(state: IState<StateNames> | null): boolean {
    if (!state) {
      return false;
    }
    const oldState: IState<StateNames> | null = this._currentState;
    // Already in the desired state.
    if (this._currentState && state.name === this._currentState.name) {
      console.warn(
        `${this._currentState.name}: Attempting to set current state to already active state`
      );
      return true;
    }
    this._newState = true;
    this._previousState = this._currentState;
    this._currentState = state;
    // DEBUG:
    if (StateMachine.DEBUG_STATES) {
      console.log(
        `STATE: ${oldState ? oldState.name : 'NULL'} -> ${this._currentState.name}`
      );
    }
    if (oldState) {
      this.onExitState$.emit({ from: oldState, to: state });
      oldState.exit(this);
    }
    state.enter(this);
    this.onEnterState$.emit({ from: oldState, to: state });
    return true;
  }

  getPreviousState(): IState<StateNames> | null {
    return this._previousState;
  }

  getState(name: StateNames | null): IState<StateNames> | null {
    const state = this.states.find((s: IState<StateNames>) => {
      return s.name === name;
    });
    return state || null;
  }
}

/**
 * Asyn event emitter used in combat for allowing effects and such
 * to execute in an async manner while the machine waits to transition.
 */
export class StateAsyncEmitter<T> extends EventEmitter<T> {
  constructor(private machine: StateMachine<any>) {
    super(false);
  }
  /** @internal used to assert that multiple async listeners aren't running */
  _asyncProcessing: number = 0;
  /** @internal user callback to invoke when async event is done */
  _asyncCurrentCallback: IResumeCallback | null = null;

  notifyWait(): IResumeCallback {
    if (!this._asyncCurrentCallback) {
      throw new Error(
        'No valid async callback set!  Perhaps you called this outside of a notify event handler?'
      );
    }
    this._asyncProcessing++;
    return this._asyncCurrentCallback;
  }
  emit(value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._asyncProcessing > 0) {
        throw new Error('TODO: StateMachine cannot handle multiple async UI waits');
      }
      this._asyncCurrentCallback = () => {
        this._asyncProcessing--;
        if (this._asyncProcessing <= 0) {
          resolve();
          this._asyncProcessing = 0;
        }
      };
      this._asyncProcessing = 0;
      super.emit(value);
      if (this._asyncProcessing === 0) {
        resolve();
      }
    });
  }
}
