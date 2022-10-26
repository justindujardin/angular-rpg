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
import * as _ from 'underscore';
import { ImageResource } from '../image.resource';
import { XMLResource } from '../xml.resource';
import { compactUrl, ITileInstanceMeta, readTiledProperties } from './tiled';

export class TilesetTile {
  public properties: any = {};

  constructor(
    public id: number,
    public image: string,
    public width: number,
    public height: number
  ) {}
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
  tiles: { [gid: string]: TilesetTile } | null = null;
  maxLocalId: number = -1;
  imageUrl: string = null;
  relativeTo: string = null;
  literal: string = null; // The literal source path specified in xml
  load(data?: any): Promise<TiledTSXResource> {
    this.data = data || this.data;
    return new Promise<TiledTSXResource>((resolve, reject) => {
      const tileSet = this.getRootNode('tileset');
      this.name = this.getElAttribute(tileSet, 'name');
      this.tilewidth = parseInt(this.getElAttribute(tileSet, 'tilewidth'), 10);
      this.tileheight = parseInt(this.getElAttribute(tileSet, 'tileheight'), 10);
      const relativePath: string = this.url
        ? this.url.substr(0, this.url.lastIndexOf('/') + 1)
        : '';

      // Load tiles and custom properties.
      const tilesArray = [];
      const tiles = this.getChildren(tileSet, 'tile');
      _.each(tiles, (ts: any) => {
        const id: number = parseInt(this.getElAttribute(ts, 'id'), 10);
        if (id > this.maxLocalId) {
          this.maxLocalId = id;
        }
        const sourceImage = this.getChild(ts, 'image');
        if (!sourceImage) {
          throw new Error(
            'tileset tiles must be image collections that reference the soruce sprite image'
          );
        }
        // extract only the filename from the source image path
        let image: string = this.getElAttribute(sourceImage, 'source');
        image = image.substring(image.lastIndexOf('/') + 1);
        const width = parseInt(this.getElAttribute(sourceImage, 'width'), 10);
        const height = parseInt(this.getElAttribute(sourceImage, 'height'), 10);
        const tile: TilesetTile = new TilesetTile(id, image, width, height);
        tile.properties = readTiledProperties(ts);
        tilesArray.push(tile);
      });

      const source = this.name;
      this.imageUrl = compactUrl(
        this.relativeTo ? this.relativeTo : relativePath,
        source
      );
      console.log(`Tileset source: ${this.imageUrl}`);

      new ImageResource(this.imageUrl)
        .fetch()
        .then((res?: ImageResource) => {
          this.image = res;
          this.imageWidth = this.image.data.width;
          this.imageHeight = this.image.data.height;

          // Finally, build a tile lookup table
          const tileLookup = {};
          _.each(tilesArray, (tile) => {
            tileLookup[tile.id] = tile;
          });
          this.tiles = tileLookup;

          resolve(this);
        })
        .catch((e) => {
          reject(`Failed to load required tile map image: ${source} - ${e}`);
        });
    });
  }

  hasGid(gid: number): boolean {
    const localId = this.firstgid !== -1 ? gid - this.firstgid : gid;
    return gid >= this.firstgid && localId <= this.maxLocalId;
  }

  getTileMeta(gidOrIndex: number): ITileInstanceMeta {
    const index: number =
      this.firstgid !== -1 ? gidOrIndex - this.firstgid : gidOrIndex;
    const tile = this.tiles[index];
    return _.extend(tile || {}, {
      sheet: this.image,
      width: this.tilewidth,
      height: this.tileheight,
    });
  }
}
