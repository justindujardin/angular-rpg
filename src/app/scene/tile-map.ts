/*
 Copyright (C) 2013-2020 by Justin DuJardin and Contributors

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
// TODO: TileMap isn't getting added to Spatial DB properly.  Can't query for it!
// Scene assuming something about the spatial properties on objects?
import * as _ from 'underscore';
import { ITiledLayer, ITiledObject } from '../../app/core/resources/tiled/tiled.model';
import {
  ITileInstanceMeta,
  Point,
  Rect,
  TiledTMXResource,
  TiledTSXResource,
  TilesetTile,
} from '../core';
import { IZoneMatch, IZoneTarget } from '../models/combat/combat.model';
import { GameWorld } from '../services/game-world';
import { Scene } from './scene';
import { SceneObject } from './scene-object';

export class TileMap extends SceneObject {
  map: TiledTMXResource;
  tiles: TilesetTile[] = [];
  scene: Scene;
  features?: ITiledLayer;
  zones?: ITiledLayer;
  bounds: Rect = new Rect(0, 0, 10, 10);
  dirtyLayers: boolean = false;
  musicUrl: string;
  private _loaded: boolean = false;

  static Events: any = {
    LOADED: 'loaded',
    UNLOADED: 'unloaded',
    MAP_LOADED: 'map:loaded',
    MAP_UNLOADED: 'map:unloaded',
  };

  isLoaded(): boolean {
    return this._loaded;
  }

  loaded() {
    this.trigger(TileMap.Events.LOADED, this);
    if (this.scene) {
      this.scene.trigger(TileMap.Events.MAP_LOADED, this);
    }
    this.musicUrl = '';
    if (this.map?.properties?.music) {
      this.musicUrl = this.map.properties.music;
    }

    this._loaded = true;
  }

  unloaded() {
    this.trigger(TileMap.Events.UNLOADED, this);
    if (this.scene) {
      this.scene.trigger(TileMap.Events.MAP_UNLOADED, this);
    }
    this._loaded = false;
  }

  setMap(map: TiledTMXResource) {
    if (!map /* || !map.isReady() */) {
      return false;
    }
    if (this.map) {
      this.unloaded();
    }
    this.map = map;
    this.bounds = new Rect(0, 0, this.map.width, this.map.height);
    const idSortedSets = _.sortBy(this.map.tilesets, (o: TiledTSXResource) => {
      return o.firstgid;
    });
    this.tiles.length = 0;
    idSortedSets.forEach((tiles: TiledTSXResource) => {
      while (this.tiles.length < tiles.firstgid) {
        this.tiles.push(null);
      }
      Object.values(tiles.tiles).forEach((tile: TilesetTile) => {
        const tileId = tiles.firstgid + tile.id;
        while (this.tiles.length < tileId) {
          this.tiles.push(null);
        }
        this.tiles[tileId] = tile;
      });
    });
    this.features = _.where(this.map.layers, { name: 'Features' })[0] || null;
    this.zones = _.where(this.map.layers, { name: 'Zones' })[0] || null;
    this.loaded();
    return true;
  }

  getLayers(): ITiledLayer[] {
    return this.map ? this.map.layers : [];
  }

  getLayer(name: string): ITiledLayer {
    return _.where(this.map.layers, { name })[0] as ITiledLayer;
  }

  getTerrain(layer: string, x: number, y: number) {
    return this.getTileData(this.getLayer(layer), x, y);
  }

  getTileData(layer: ITiledLayer, x: number, y: number) {
    if (!this.map || !layer || !layer.data || !this.bounds.pointInRect(x, y)) {
      return null;
    }
    const terrainIndex = y * this.map.width + x;
    const tileIndex = layer.data[terrainIndex];
    return this.tiles[tileIndex];
  }

  getTileGid(layer: string, x: number, y: number): number {
    const terrain: ITiledLayer = this.getLayer(layer);
    if (!this.map || !terrain?.data || !this.bounds.pointInRect(x, y)) {
      return null;
    }
    const terrainIndex = y * this.map.width + x;
    return terrain.data[terrainIndex];
  }

  destroy(): void {
    this.unloaded();
    return super.destroy();
  }

  getFeature(name: string) {
    return _.find(this.features.objects, (feature: any) => {
      return feature.name === name;
    });
  }

  getEntryPoint(): Point {
    // If no point is specified, use the position of the first Portal on the current map
    const portal: any = _.where(this.features.objects, {
      type: 'PortalFeatureComponent',
    })[0];
    if (portal) {
      return new Point(portal.x / portal.width, portal.y / portal.height);
    }
    return new Point(-1, -1);
  }

  /**
   * Enumerate the map and target combat zones for a given position on this map.
   * @param at The position to check for a sub-zone in the map
   * @returns {IZoneMatch} The map and target zones that are null if they don't exist
   */
  getCombatZones(at: Point): IZoneMatch {
    const result: IZoneMatch = {
      map: null,
      targets: [],
      targetPoint: at,
    };
    if (this.map?.properties) {
      if (this.map.properties.combatZone) {
        result.map = this.map.properties.combatZone;
      }
    }
    // Determine which zone and combat type
    const invTileSize = 1 / this.map.tilewidth;
    const zones: IZoneTarget[] = _.map(this.zones?.objects, (z: ITiledObject) => {
      const x = z.x * invTileSize;
      const y = z.y * invTileSize;
      const w = z.width * invTileSize;
      const h = z.height * invTileSize;
      return {
        bounds: new Rect(x, y, w, h),
        zone: z.properties?.zone,
        water: z.properties?.water || false,
      };
    });
    result.targets = zones.filter((z: IZoneTarget) => {
      return z.bounds.pointInRect(at) && z.zone;
    });
    return result;
  }

  toString() {
    return this.map ? this.map.url : 'no-data';
  }
  getTileMeta(gid: number): ITileInstanceMeta {
    if (this.tiles.length <= gid) {
      return null;
    }
    const source = _.find(this.map.tilesets, (t: TiledTSXResource) => {
      const hasGid = t.hasGid(gid);
      return hasGid;
    });
    if (!source) {
      return null;
    }

    const meta = source.getTileMeta(gid);
    // Derive x/y values from sprite registry metadata for spritesheets
    const f = GameWorld.get().sprites.getSpriteMeta(meta.image);
    return {
      ...meta,
      x: f.x,
      y: f.y,
    };
  }
}
