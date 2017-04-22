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
import {AfterViewInit, Component, Input, OnDestroy} from '@angular/core';
import {SceneObjectBehavior} from '../../game/pow2/scene/scene-object-behavior';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subscription} from 'rxjs/Subscription';
import {ImageResource} from '../../game/pow-core/resources/image.resource';
import {GameWorld} from '../services/game-world';
import {ISpriteMeta} from '../../game/pow2/core/api';

@Component({
  selector: 'sprite-render-behavior',
  template: `
    <ng-content></ng-content>`
})
export class SpriteRenderBehaviorComponent extends SceneObjectBehavior implements AfterViewInit, OnDestroy {

  constructor(public gameWorld: GameWorld) {
    super();
  }

  private _icon$: BehaviorSubject<string> = new BehaviorSubject(null);
  icon$: Observable<string> = this._icon$;

  @Input() set icon(value: string) {
    this._icon$.next(value);
  }

  get icon(): string {
    return this._icon$.value;
  }

  private _subscription: Subscription;

  meta: ISpriteMeta | null = null;
  image: HTMLImageElement | null = null;

  ngAfterViewInit(): void {
    this._subscription = this.icon$.distinctUntilChanged().do((name: string) => {
      if (!name) {
        this.meta = null;
        this.image = null;
        return;
      }
      this.meta = this.gameWorld.sprites.getSpriteMeta(name);
      if (this.meta) {
        this.gameWorld.sprites.getSpriteSheet(this.meta.source).then((images: ImageResource[]) => {
          this.image = images[0].data;
        });
      }
    }).subscribe();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

}
