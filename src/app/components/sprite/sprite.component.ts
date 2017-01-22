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
import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {RPGGame} from '../../services/index';
import {SpriteRender} from '../../services/spriteRender';
import {Observable, ReplaySubject, BehaviorSubject} from 'rxjs';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'rpg-sprite',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<img [style.width]="width$ | async" [style.height]="height$ | async" [src]="dataUrl$ | async">`
})
export class RPGSprite {

  static INVALID_IMAGE: string = 'assets/images/a/blank.gif';

  private _dataUrl$ = new ReplaySubject<SafeResourceUrl>(1);
  dataUrl$: Observable<SafeResourceUrl> = this._dataUrl$;
  private _width$ = new BehaviorSubject<string>('64');
  width$: Observable<string> = this._width$;
  private _height$ = new BehaviorSubject<string>('64');
  height$: Observable<string> = this._height$;
  private _name$ = new BehaviorSubject<string>(RPGSprite.INVALID_IMAGE);
  name$: Observable<string> = this._name$;
  private _frame$ = new BehaviorSubject<number>(0);
  frame$: Observable<number> = this._frame$;

  @Input()
  set width(value: string) {
    this._width$.next(value);
  }

  @Input()
  set height(value: string) {
    this._height$.next(value);
  }

  @Input()
  set frame(value: number) {
    if (this._frame$.value !== value) {
      this._frame$.next(value);
      this._get(this._name$.value);
    }
  }


  @Input()
  set name(value: string) {
    if (!value) {
      this._name$.next(RPGSprite.INVALID_IMAGE);
      return;
    }
    this._name$.next(value);
    this._get(value);
  }

  constructor(private game: RPGGame,
              private sanitizer: DomSanitizer,
              private renderer: SpriteRender) {
  }

  private _get(src:string) {
    if(!src || src === RPGSprite.INVALID_IMAGE) {
      this._dataUrl$.next(RPGSprite.INVALID_IMAGE);
      return;
    }
    this.renderer.getSingleSprite(src, this._frame$.value).then((sprite: HTMLImageElement) => {
      // Get the context for drawing
      const width: number = parseInt(this._width$.value);
      const height: number = parseInt(this._height$.value);

      const renderContext: any = this.game.getRenderContext(width, height);
      renderContext.clearRect(0, 0, width, height);
      renderContext.drawImage(sprite, 0, 0, width, height);
      const imageDataUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.game.releaseRenderContext());
      this._dataUrl$.next(imageDataUrl);
    });

  }
}
