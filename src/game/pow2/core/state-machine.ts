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
import * as _ from 'underscore';
import { Events, IEvents } from '../../pow-core/events';
import { IState } from './state';

export interface IStateMachine<TStateMachineStateNames extends string> extends IEvents {
  update(data: any);
  addState(state: IState<TStateMachineStateNames>);
  addStates(states: IState<TStateMachineStateNames>[]);
  getCurrentState(): IState<TStateMachineStateNames>;
  getCurrentName(): TStateMachineStateNames;
  setCurrentStateObject(newState: IState<TStateMachineStateNames>): boolean;
  setCurrentState(name: TStateMachineStateNames): boolean;
  getPreviousState(): IState<TStateMachineStateNames>;
  getState(name: TStateMachineStateNames): IState<TStateMachineStateNames>;
}

export interface IResumeCallback {
  (): void;
}

// Implementation
// -------------------------------------------------------------------------
export class StateMachine<StateNames extends string>
  extends Events
  implements IStateMachine<StateNames> {
  static DEBUG_STATES: boolean = true;

  static Events: any = {
    ENTER: 'enter',
    EXIT: 'exit',
  };

  defaultState: StateNames | null = null;
  states: IState<StateNames>[] = [];
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

  addState(state: IState<StateNames>) {
    this.states.push(state);
  }

  addStates(states: IState<StateNames>[]) {
    this.states = _.unique(this.states.concat(states));
  }

  getCurrentState(): IState<StateNames> {
    return this._currentState;
  }

  getCurrentName(): StateNames {
    return this._currentState !== null ? this._currentState.name : null;
  }

  /**
   * Set the current state after the callstack unwinds.
   * @param newState A state object
   */
  setCurrentStateObject(state: IState<StateNames>): boolean {
    if (!state) {
      console.error(`STATE NOT FOUND: ${state}`);
      return false;
    }
    if (this._pendingState !== null && this._pendingState.name !== state.name) {
      console.log(
        `Overwriting pending state (${this._pendingState.name}) with (${state.name})`
      );
      this._pendingState = state;
    } else if (!this._pendingState) {
      this._pendingState = state;
      _.defer(() => {
        state = this._pendingState;
        this._pendingState = null;
        if (!this._setCurrentState(state)) {
          console.error(`Failed to set state: ${state.name}`);
        }
      });
    }
    return true;
  }
  /**
   * Set the current state by name after the callstack unwinds.
   * @param name A known state name
   */
  setCurrentState(name: StateNames): boolean {
    let state = this.getState(name);
    return this.setCurrentStateObject(state);
  }

  private _setCurrentState(state: IState<StateNames>) {
    if (!state) {
      return false;
    }
    const oldState: IState<StateNames> = this._currentState;
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
      this.trigger(StateMachine.Events.EXIT, oldState, state);
      oldState.exit(this);
    }
    state.enter(this);
    this.trigger(StateMachine.Events.ENTER, state, oldState);
    return true;
  }

  getPreviousState(): IState<StateNames> {
    return this._previousState;
  }

  getState(name: StateNames): IState<StateNames> {
    return _.find(this.states, (s: IState<StateNames>) => {
      return s.name === name;
    });
  }

  private _asyncProcessing: number = 0;
  private _asyncCurrentCallback: IResumeCallback = null;

  /**
   * Notify the game UI of an event, and wait for it to be handled,
   * if there is a handler.
   */
  notify(msg: string, data: any, callback?: () => any) {
    if (this._asyncProcessing > 0) {
      throw new Error('TODO: StateMachine cannot handle multiple async UI waits');
    }

    this._asyncCurrentCallback = () => {
      this._asyncProcessing--;
      if (this._asyncProcessing <= 0) {
        if (callback) {
          callback();
        }
        this._asyncProcessing = 0;
      }
    };
    this._asyncProcessing = 0;
    this.trigger(msg, data);
    if (this._asyncProcessing === 0) {
      if (callback) {
        callback();
      }
    }
  }

  notifyWait(): IResumeCallback {
    if (!this._asyncCurrentCallback) {
      throw new Error(
        'No valid async callback set!  Perhaps you called this outside of a notify event handler?'
      );
    }
    this._asyncProcessing++;
    return this._asyncCurrentCallback;
  }
}
