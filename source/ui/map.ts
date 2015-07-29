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

import {ElementRef} from 'angular2/angular2';
import * as rpg from '../game';
import {RPGGame} from './services/rpggame';
import {GameTileMap} from '../gameTileMap';


/**
 * Base implementation of a view for a GameTileMap.
 */
export class Map extends pow2.tile.TileMapView {
  tileMap:GameTileMap;

  get mapName():string {
    return this.tileMap ? this.tileMap.name : '';
  }

  set mapName(value:string) {
    this._loadMap(value);
  }


  get music():boolean {
    return this._music;
  }

  set music(enabled:boolean) {
    if (this._music === enabled) {
      return;
    }
    this._music = enabled;
    this._music ? this._playMusic() : this._destroyMusic();
  }
  private _music:boolean = true;


  private _musicComponent:pow2.scene.components.SoundComponent = null;


  /**
   * The map view bounds in world space.
   */
  protected _bounds:pow2.Point = new pow2.Point();

  constructor(elRef:ElementRef, public game:RPGGame) {
    super(elRef.nativeElement.querySelector('canvas'), game.loader);
  }

  /**
   * Load a map by name as a [[Promise]].
   * @param value The map name, e.g. "keep" or "isle"
   * @private
   */
  protected _loadMap(value:string):Promise<GameTileMap> {
    return new Promise<GameTileMap>((resolve, reject)=> {
      this.game.loader.load(this.game.world.getMapUrl(value), (map:pow2.TiledTMXResource)=> {
        if (!map || !map.isReady()) {
          return reject('invalid resource: ' + this.game.world.getMapUrl(value));
        }
        if (this.tileMap) {
          this._destroyMusic();
          this.tileMap.destroy();
          this.tileMap = null;
        }
        this.tileMap = this.game.world.entities.createObject('GameMapObject', {
          resource: map
        });
        if(!this.tileMap){
          return reject('Unable to create tilemap from entity container object');
        }
        this.setTileMap(this.tileMap);
        if(this._music){
          this._playMusic();
        }
        this.game.world.scene.addObject(this.tileMap);
        this._onMapLoaded(this.tileMap);
        resolve(this.tileMap);
      });
    });
  }

  /**
   * Called when a map has been loaded, and is about to be added to the current scene.
   *
   * This callback is useful for doing map-specific things when the map changes.
   * @private
   */
  protected _onMapLoaded(map:GameTileMap) {

  }


  protected _onResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._bounds.set(this.canvas.width, this.canvas.height);
    this._bounds = this.screenToWorld(this._bounds);
    var ctx:any = this.context;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
  }


  protected _destroyMusic() {
    if (this._musicComponent) {
      this.tileMap && this.tileMap.removeComponent(this._musicComponent);
      this._musicComponent = null;
    }
  }

  protected _playMusic() {
    if(!this.tileMap){
      return;
    }
    if (this.tileMap.musicUrl) {
      this._destroyMusic();
      this._musicComponent = new pow2.scene.components.SoundComponent({
        url: this.tileMap.musicUrl,
        volume: 0.1,
        loop: true
      });
      this.tileMap.addComponent(this._musicComponent);
    }
  }


}
