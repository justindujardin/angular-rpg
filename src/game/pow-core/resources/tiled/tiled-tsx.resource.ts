/*
 Copyright (C) 2013-2015 by Justin DuJardin

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
import {XMLResource} from '../xml.resource';
import {ImageResource} from '../image.resource';
import * as _ from 'underscore';
import {ITileInstanceMeta, compactUrl, readTiledProperties} from './tiled';
import * as $ from 'jquery';

export class TilesetTile {
  id: number;
  properties: any = {};

  constructor(id: number) {
    this.id = id;
  }
}
/**
 * A Tiled TSX tileset resource
 */
export class TiledTSXResource extends XMLResource {
  name: string = null;
  tilewidth: number = 16;
  tileheight: number = 16;
  imageWidth: number = 0;
  imageHeight: number = 0;
  image: ImageResource = null;
  url: string;
  firstgid: number = -1;
  tiles: any[] = [];
  relativeTo: string = null;
  imageUrl: string = null;
  literal: string = null; // The literal source path specified in xml
  load(data?: any): Promise<TiledTSXResource> {
    this.data = data || this.data;
    return new Promise<TiledTSXResource>((resolve, reject) => {
      const tileSet = this.getRootNode('tileset');
      this.name = this.getElAttribute(tileSet, 'name');
      this.tilewidth = parseInt(this.getElAttribute(tileSet, 'tilewidth'), 10);
      this.tileheight = parseInt(this.getElAttribute(tileSet, 'tileheight'), 10);
      const relativePath: string = this.url ? this.url.substr(0, this.url.lastIndexOf('/') + 1) : '';

      // Load tiles and custom properties.
      const tiles = this.getChildren(tileSet, 'tile');
      _.each(tiles, (ts: any) => {
        const id: number = parseInt(this.getElAttribute(ts, 'id'), 10);
        const tile: TilesetTile = new TilesetTile(id);
        tile.properties = readTiledProperties(ts);
        this.tiles.push(tile);
      });

      const image: any = this.getChild(tileSet, 'img');
      if (!image || image.length === 0) {
        return resolve(this);
      }
      const source = this.getElAttribute(image, 'source');
      this.imageWidth = parseInt(this.getElAttribute(image, 'width') || '0', 10);
      this.imageHeight = parseInt(this.getElAttribute(image, 'height') || '0', 10);
      this.imageUrl = compactUrl(this.relativeTo ? this.relativeTo : relativePath, source);
      console.log(`Tileset source: ${this.imageUrl}`);

      new ImageResource(this.imageUrl)
        .fetch()
        .then((res?: ImageResource) => {
          this.image = res;
          this.imageWidth = this.image.data.width;
          this.imageHeight = this.image.data.height;

          // Finally, build an expanded tileset from the known image w/h and the
          // tiles with properties that are specified in the form of <tile> objects.
          const xUnits = this.imageWidth / this.tilewidth;
          const yUnits = this.imageHeight / this.tileheight;
          const tileCount = xUnits * yUnits;
          const tileLookup = new Array(tileCount);
          for (let i = 0; i < tileCount; i++) {
            tileLookup[i] = false;
          }
          _.each(this.tiles, (tile) => {
            tileLookup[tile.id] = tile.properties;
          });
          this.tiles = tileLookup;

          resolve(this);
        })
        .catch((e) => {
          reject(`Failed to load required TileMap image: ${source} - ${e}`);
        });
    });
  }

  hasGid(gid: number): boolean {
    return this.firstgid !== -1
      && gid >= this.firstgid
      && gid < this.firstgid + this.tiles.length;
  }

  getTileMeta(gidOrIndex: number): ITileInstanceMeta {
    const index: number = this.firstgid !== -1 ? (gidOrIndex - (this.firstgid)) : gidOrIndex;
    const tilesX = this.imageWidth / this.tilewidth;
    const x = index % tilesX;
    const y = Math.floor((index - x) / tilesX);
    return _.extend(this.tiles[index] || {}, {
      image: this.image,
      url: this.imageUrl,
      x: x * this.tilewidth,
      y: y * this.tileheight,
      width: this.tilewidth,
      height: this.tileheight
    });
  }
}
