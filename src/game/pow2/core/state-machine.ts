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
// State Machine Interfaces
// -------------------------------------------------------------------------
import * as _ from 'underscore';
import {IState} from './state';
import {Events, IEvents} from '../../pow-core/events';

export interface IStateMachine extends IEvents {
  update(data: any);
  addState(state: IState);
  addStates(states: IState[]);
  getCurrentState(): IState;
  getCurrentName(): string;
  setCurrentState(name: string): boolean;
  setCurrentState(state: IState): boolean;
  setCurrentState(newState: any): boolean;
  getPreviousState(): IState;
  getState(name: string): IState;
}

export interface IResumeCallback {
  (): void;
}

// Implementation
// -------------------------------------------------------------------------
export class StateMachine extends Events implements IStateMachine {

  static DEBUG_STATES: boolean = true;

  static Events: any = {
    ENTER: 'enter',
    EXIT: 'exit'
  };

  defaultState: string = null;
  states: IState[] = [];
  private _currentState: IState = null;
  private _previousState: IState = null;
  private _newState: boolean = false;
  private _pendingState: IState = null;

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

  addState(state: IState) {
    this.states.push(state);
  }

  addStates(states: IState[]) {
    this.states = _.unique(this.states.concat(states));
  }

  getCurrentState(): IState {
    return this._currentState;
  }

  getCurrentName(): string {
    return this._currentState !== null ? this._currentState.name : null;
  }

  /**
   * Set the current state after the callstack unwinds.
   * @param newState {string|IState} Either a state object or the name of one.
   */
  setCurrentState(newState: IState | string): boolean {
    let state = typeof newState === 'string' ? this.getState(newState) : <IState> newState;
    if (!state) {
      console.error(`STATE NOT FOUND: ${newState}`);
      return false;
    }
    if (this._pendingState !== null && this._pendingState.name !== state.name) {
      console.log(`Overwriting pending state (${this._pendingState.name}) with (${state.name})`);
      this._pendingState = state;
    }
    else if (!this._pendingState) {
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

  private _setCurrentState(state: IState) {
    if (!state) {
      return false;
    }
    const oldState: IState = this._currentState;
    // Already in the desired state.
    if (this._currentState && state.name === this._currentState.name) {
      console.warn(`${this._currentState.name}: Attempting to set current state to already active state`);
      return true;
    }
    this._newState = true;
    this._previousState = this._currentState;
    this._currentState = state;
    // DEBUG:
    if (StateMachine.DEBUG_STATES) {
      console.log(`STATE: ${oldState ? oldState.name : 'NULL'} -> ${this._currentState.name}`);
    }
    if (oldState) {
      this.trigger(StateMachine.Events.EXIT, oldState, state);
      oldState.exit(this);
    }
    state.enter(this);
    this.trigger(StateMachine.Events.ENTER, state, oldState);
    return true;
  }

  getPreviousState(): IState {
    return this._previousState;
  }

  getState(name: string): IState {
    return _.find(this.states, (s: IState) => {
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
      throw new Error('No valid async callback set!  Perhaps you called this outside of a notify event handler?');
    }
    this._asyncProcessing++;
    return this._asyncCurrentCallback;
  }
}
