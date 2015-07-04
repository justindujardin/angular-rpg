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

import {Component, View, bootstrap,ElementRef} from 'angular2/angular2';

import {GameWorld} from '../../gameWorld';
import {GameTileMap} from '../../gameTileMap';
import {RPGMapView} from '../../rpgMapView';
import {GameEntityObject} from '../../objects/gameEntityObject';
import {GameStateMachine} from '../../states/gameStateMachine';

import {GameStateModel,HeroModel,HeroTypes} from '../../models/all';

import {RPGGame} from '../services/all';

@Component({
  selector: 'world-map',
  properties: ['mapName', 'playerPosition'],
  host: {
    '(window:resize)': '_onResize($event)'
  }
})
@View({
  template: `
  <canvas [width]="styleWidth" [height]="styleHeight">
    Your browser doesn't support this.
  </canvas>
  `,
  host: {
    '[style.color]': 'styleBackground'
  }
})
export class WorldMap {
  styleBackground:string = 'rgba(0,0,0,1)';
  tileMap:GameTileMap = null;


  constructor(public elRef:ElementRef, public game:RPGGame) {
    this._canvas = elRef.nativeElement.querySelector('canvas');
    this._context = <CanvasRenderingContext2D>this._canvas.getContext("2d");

    this._view = new RPGMapView(this._canvas, game.loader);
    this._view.camera.point.set(-0.5, -0.5);
    game.world.scene.addView(this._view);
    _.defer(() => this._onResize());
  }

  get mapName():string {
    return this.tileMap ? this.tileMap.name : '';
  }

  set mapName(value:string) {
    if (this.tileMap) {
      this.tileMap.destroy();
      this.tileMap = null;
    }
    this.game.loader.load(this.game.world.getMapUrl(value), (map:pow2.TiledTMXResource)=> {
      this.tileMap = this.game.world.entities.createObject('GameMapObject', {
        resource: map
      });
      this.game.world.scene.addObject(this.tileMap);
      this.tileMap.loaded();
      this.game.createPlayer(this.game.hero, this.tileMap);
      this._onResize();
      this._view.setTileMap(this.tileMap);
    });
  }

  private _player:HeroModel = null;
  set player(value:HeroModel) {
    this._player = value;
    this.game.createPlayer(this._player, this.tileMap);
  }

  get player():HeroModel {
    return this._player;
  }

  private _position = new pow2.Point();

  set playerPosition(value:pow2.Point) {
    this._position.set(value);
    if (this.game.sprite) {
      this.game.sprite.setPoint(value);
    }
  }

  get playerPosition() {
    return this._position;
  }

  private _view:RPGMapView = null;
  private _canvas:HTMLCanvasElement = null;
  private _context:any = null;
  private _bounds:pow2.Point = new pow2.Point();

  private _onResize() {
    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;
    this._bounds.set(this._canvas.width, this._canvas.height);
    this._bounds = this._view.screenToWorld(this._bounds);


    // TileMap
    // Camera (window bounds)
    if (this.tileMap) {
      var tileOffset = this.tileMap.bounds.getCenter();
      var offset = this._bounds.clone().divide(2).multiply(-1).add(tileOffset);
      this._view.camera.point.set(offset.floor());
    }

    this._view.camera.extent.set(this._bounds);

    this._context.webkitImageSmoothingEnabled = false;
    this._context.mozImageSmoothingEnabled = false;
    this._context.imageSmoothingEnabled = false;
  }

}
