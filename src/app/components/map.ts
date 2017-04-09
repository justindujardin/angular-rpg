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
import {ElementRef} from '@angular/core';
import {GameTileMap} from '../../game/gameTileMap';
import {TileMapView} from '../../game/pow2/tile/tileMapView';
import {SoundComponent} from '../../game/pow2/scene/components/soundComponent';
import {TiledTMXResource} from '../../game/pow-core/resources/tiled/tiledTmx';
import {getMapUrl} from '../../game/pow2/core/api';
import {GameWorld} from '../services/gameWorld';
import {ResourceLoader} from '../../game/pow-core/resourceLoader';

/**
 * Base implementation of a view for a GameTileMap.
 */
export class Map extends TileMapView {
  tileMap: GameTileMap;

  get mapName(): string {
    return this.tileMap ? this.tileMap.name : '';
  }

  set mapName(value: string) {
    this._loadMap(value);
  }

  get music(): boolean {
    return this._music;
  }

  set music(enabled: boolean) {
    if (this._music === enabled) {
      return;
    }
    this._music = enabled;
    this._music ? this._playMusic() : this._destroyMusic();
  }

  private _music: boolean = true;

  private _musicComponent: SoundComponent = null;

  constructor(elRef: ElementRef,
              public loader: ResourceLoader,
              public world: GameWorld) {
    super(elRef.nativeElement.querySelector('canvas'));
  }

  /**
   * Load a map by name as a [[Promise]].
   * @param value The map name, e.g. "keep" or "isle"
   * @private
   */
  protected _loadMap(value: string): Promise<GameTileMap> {

    // TODO: Check if value is already set map (set binding of mapName is calling this multiple times.)
    return new Promise<GameTileMap>((resolve, reject) => {
      this.loader.load(getMapUrl(value))
        .then((maps: TiledTMXResource[]) => {
          const map = maps[0];
          if (!map || !map.data) {
            return reject(`invalid resource: ${getMapUrl(value)}`);
          }
          if (this.tileMap) {
            this._destroyMusic();
            this.tileMap.destroy();
            this.tileMap = null;
          }
          return this.world.entities.createObject('GameMapObject', {
            resource: map
          });
        })
        .then((map: GameTileMap) => {
          this.tileMap = map;
          if (this._music) {
            this._playMusic();
          }
          this.world.scene.addObject(this.tileMap);
          this._onMapLoaded(this.tileMap);
          resolve(this.tileMap);
        })
        .catch((e) => {
          return reject(`Unable to create Map: ${e}`);
        });
    });
  }

  /**
   * Called when a map has been loaded, and is about to be added to the current scene.
   *
   * This callback is useful for doing map-specific things when the map changes.
   * @private
   */
  protected _onMapLoaded(map: GameTileMap) {
    // Nothing
  }

  public _onResize(event?: Event) {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._bounds.set(this.canvas.width, this.canvas.height);
    this._bounds = this.screenToWorld(this._bounds);
    const context: any = this.context;
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
  }

  protected _destroyMusic() {
    if (this._musicComponent) {
      if (this.tileMap) {
        this.tileMap.removeBehavior(this._musicComponent);
      }
      this._musicComponent = null;
    }
  }

  protected _playMusic() {
    if (!this.tileMap) {
      return;
    }
    if (this.tileMap.musicUrl) {
      console.warn('turn music back on at some point');

      // this._destroyMusic();
      // this._musicComponent = new SoundComponent({
      //   url: this.tileMap.musicUrl,
      //   volume: 0.1,
      //   loop: true
      // });
      // this.tileMap.addBehavior(this._musicComponent);
    }
  }

}
