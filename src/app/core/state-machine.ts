
// State Machine Interfaces
// -------------------------------------------------------------------------
import { EventEmitter } from '@angular/core';
import * as _ from 'underscore';
import { State } from './state';

export interface IResumeCallback {
  (): void;
}

/** A state change description */
export interface IStateChange<T extends string> {
  from: State<T> | null;
  to: State<T>;
}

// Implementation
// -------------------------------------------------------------------------
export class StateMachine<StateNames extends string> {
  static DEBUG_STATES: boolean = true;

  defaultState: StateNames | null = null;
  states: State<StateNames>[] = [];

  /** Emits when a new state has been entered */
  onEnterState$ = new EventEmitter<IStateChange<StateNames>>();
  /** Emits when an existing state is about to be exited */
  onExitState$ = new EventEmitter<IStateChange<StateNames>>();

  /** Processing an async transition */
  private _transitioning: boolean = false;
  private _currentState: State<StateNames> | null = null;
  private _previousState: State<StateNames> | null = null;
  private _pendingStates: [State<StateNames>, (result: boolean) => void][] = [];

  addState(state: State<StateNames>): void {
    this.states.push(state);
  }

  addStates(states: State<StateNames>[]): void {
    this.states = _.unique(this.states.concat(states));
  }

  getCurrentState(): State<StateNames> | null {
    return this._currentState;
  }

  getCurrentName(): StateNames | null {
    return this._currentState !== null ? this._currentState.name : null;
  }

  /**
   * Set the current state after the callstack unwinds.
   * @param newState A state object
   */
  async setCurrentStateObject(state: State<StateNames> | null): Promise<boolean> {
    if (!state) {
      console.error(`STATE NOT FOUND: ${state}`);
      return false;
    }
    return await this._setCurrentState(state);
  }
  /**
   * Set the current state by name after the callstack unwinds.
   * @param name A known state name
   */
  async setCurrentState(name: StateNames | null): Promise<boolean> {
    let state = this.getState(name);
    return await this.setCurrentStateObject(state);
  }

  private async _setCurrentState(state: State<StateNames> | null): Promise<boolean> {
    if (!state) {
      return false;
    }
    const oldState: State<StateNames> | null = this._currentState;
    // Already in the desired state.
    if (this._currentState && state.name === this._currentState.name) {
      console.warn(
        `${this._currentState.name}: Attempting to set current state to already active state`
      );
      return true;
    }
    // Already processing an async transition. Add to the queue
    if (this._transitioning) {
      return new Promise((resolve) => {
        this._pendingStates.push([state, resolve]);
      });
    }
    this._transitioning = true;
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
      await oldState.exit(this);
    }
    await state.enter(this);
    this.onEnterState$.emit({ from: oldState, to: state });

    if (this._pendingStates.length === 0) {
      this._transitioning = false;
    } else {
      // Fire off the next promise
      Promise.resolve().then(async () => {
        const target = this._pendingStates.shift();
        if (target) {
          const [nextState, completionPromise] = target;
          // Set transitioning flag immediately before next call, so it doesn't end up
          // getting queued again.
          this._transitioning = false;
          const okay = await this._setCurrentState(nextState);
          completionPromise(okay);
        }
      });
    }
    return true;
  }

  getPreviousState(): State<StateNames> | null {
    return this._previousState;
  }

  getState(name: StateNames | null): State<StateNames> | null {
    const state = this.states.find((s: State<StateNames>) => {
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
