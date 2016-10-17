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
import {Component} from '@angular/core';
import {RPGGame} from '../../services/index';
import {GameWorld} from '../../services/gameWorld';
import {SpriteRender} from '../../services/spriteRender';

@Component({
  selector: 'rpg-sprite',
  inputs: ['name', 'frame', 'width', 'height'],
  host: {
    '[style.width]': 'width',
    '[style.height]': 'height'
  },
  template: `<img [src]="dataUrl">`
})
export class RPGSprite {

  static INVALID_IMAGE: string = 'images/a/blank.gif';

  dataUrl: string = '';
  width: string = '64';
  height: string = '64';

  private _frame: number = 0;
  set frame(value: number) {
    if (this._frame !== value) {
      this._frame = value;
      this._get();
    }
  }

  get frame(): number {
    return this._frame;
  }

  private _name: string = RPGSprite.INVALID_IMAGE;
  set name(value: string) {
    if (!value) {
      this._name = RPGSprite.INVALID_IMAGE;
      return;
    }
    this._name = value;
    this._get();
  }

  get name(): string {
    return this._name;
  }

  constructor(private game: RPGGame,
              private world: GameWorld,
              private renderer: SpriteRender) {
  }

  private _get() {
    this.renderer.getSingleSprite(this._name, this._frame).then((sprite: HTMLImageElement) => {
      // Get the context for drawing
      var width: number = parseInt(this.width);
      var height: number = parseInt(this.height);

      var renderContext: any = this.game.getRenderContext(width, height);
      renderContext.clearRect(0, 0, width, height);
      renderContext.drawImage(sprite, 0, 0, width, height);
      this.dataUrl = this.game.releaseRenderContext();
    });

  }
}
