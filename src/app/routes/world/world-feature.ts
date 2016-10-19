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
import {OnDestroy} from '@angular/core';
import {IScene} from '../../../game/pow2/interfaces/IScene';
import {BehaviorSubject, Observable} from 'rxjs';
import {GameFeatureComponent} from '../../../game/rpg/components/gameFeatureComponent';

/** Simple wrapper class to DRY up some duplicated event listener logic for each feature type */
export class WorldFeatureBase implements OnDestroy {
  onEnter(feature: GameFeatureComponent) {
  }

  onExit(feature: GameFeatureComponent) {
  }

  ngOnDestroy() {
    this._detachListeners(this._scene$.value);
  }


  private _scene$ = new BehaviorSubject<IScene>(null);

  /** Observable of the scene this feature view is rendering */
  scene$: Observable<IScene> = this._scene$;

  /** Imperative set for binding scene */
  set scene(value: IScene) {
    this._detachListeners(this._scene$.value);
    this._attachListeners(value);
    this._scene$.next(value);
  }

  private _eventName$ = new BehaviorSubject<string>('');

  /** Observable of the name prefix for the feature type */
  eventName$: Observable<string> = this._eventName$;

  set eventName(value: string) {
    this._eventName$.next(value);
    this._detachListeners(this._scene$.value);
    this._attachListeners(this._scene$.value);

  }

  private _attachListeners(scene: IScene) {
    if (!scene) {
      return;
    }
    scene.on(this._eventName$.value + ':entered', this.onEnter, this);
    scene.on(this._eventName$.value + ':exited', this.onExit, this);
  }

  private _detachListeners(scene: IScene) {
    if (scene) {
      scene.off(this._eventName$.value + ':entered', null, this);
      scene.off(this._eventName$.value + ':exited', null, this);
    }
  }

}
