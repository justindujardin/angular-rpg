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
import {Map} from '../map';

@Component({
  selector: 'world-map',
  properties: ['mapName', 'player', 'playerPosition'],
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
export class WorldMap extends Map {
  styleBackground:string = 'rgba(0,0,0,1)';
  tileMap:GameTileMap = null;


  constructor(public elRef:ElementRef, public game:RPGGame) {
    super(elRef,game);
    this._view = new RPGMapView(this._canvas, game.loader);
    this._view.camera.point.set(-0.5, -0.5);
    game.world.scene.addView(this._view);
    _.defer(() => this._onResize());

    // When a portal is entered, update the map view to reflect the change.
    game.world.scene.on('portal:entered', (data:any) => {
      this._loadMap(data.map).then(()=> {
        this.game.partyMapName = data.map;
        this.game.partyPosition = data.target;
      }).catch(console.error.bind(console));
    });
  }

  protected _onMapLoaded(map:GameTileMap) {
    if (this._player) {
      this.game.createPlayer(this._player, this.tileMap);
    }
    this._onResize();
  }

  private _player:HeroModel = null;
  set player(value:HeroModel) {
    this._player = value;
    if (this.tileMap) {
      this.game.createPlayer(this._player, this.tileMap);
    }
  }

  get player():HeroModel {
    return this._player;
  }

  private _position = new pow2.Point();
  set position(value:pow2.Point) {
    this._position.set(value);
    if (this.game.sprite) {
      this.game.sprite.setPoint(value);
    }
  }

  get position() {
    return this._position;
  }

  protected _onResize() {
    super._onResize();
    // TileMap
    // Camera (window bounds)
    if (this.tileMap) {
      var tileOffset = this.tileMap.bounds.getCenter();
      var offset = this._bounds.clone().divide(2).multiply(-1).add(tileOffset);
      this._view.camera.point.set(offset.floor());
    }
    this._view.camera.extent.set(this._bounds);
  }

}
