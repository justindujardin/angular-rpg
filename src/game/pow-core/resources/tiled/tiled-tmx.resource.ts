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
import {errors} from '../../errors';
import {
  writeITiledObjectBase,
  xml2Str,
  writeITiledLayerBase,
  readTiledProperties,
  compactUrl,
  readITiledLayerBase,
  readITiledObject,
  setElAttribute,
  writeTiledProperties
} from './tiled';
import {XMLResource} from '../xml.resource';
import {Resource} from '../../resource';
import {TiledTSXResource} from './tiled-tsx.resource';
import * as _ from 'underscore';
import * as $ from 'jquery';
import 'jquery';
import {ITiledObject, ITileSetDependency, ITiledLayer} from './tiled.model';

/**
 * Use jQuery to load a TMX $map file from a URL.
 */
export class TiledTMXResource extends XMLResource {
  $map: any; // The <map> element
  width: number = 0;
  height: number = 0;
  orientation: string = 'orthogonal';
  tileheight: number = 16;
  tilewidth: number = 16;
  version: number = 1;
  properties: any = {};
  tilesets: any = {};
  layers: ITiledLayer[] = [];
  xmlHeader: string = '<?xml version="1.0" encoding="UTF-8"?>';

  write(): any {
    let root: any = $('<map/>');
    setElAttribute(root, 'version', this.version);
    setElAttribute(root, 'orientation', this.orientation);
    setElAttribute(root, 'width', this.width);
    setElAttribute(root, 'height', this.height);
    setElAttribute(root, 'tilewidth', this.tilewidth);
    setElAttribute(root, 'tileheight', this.tileheight);
    writeTiledProperties(root, this.properties);

    _.each(this.tilesets, (tileSet: any) => {
      if (!tileSet.literal) {
        throw new Error('Add support for inline TSX writing');
      }
      if (!tileSet.firstgid) {
        throw new Error(errors.INVALID_ITEM);
      }
      const tilesetElement: any = $('<tileset/>');
      tilesetElement.attr('firstgid', tileSet.firstgid);
      tilesetElement.attr('source', tileSet.literal);
      root.append(tilesetElement);
    });

    _.each(this.layers, (layer: ITiledLayer) => {
      let layerElement: any = null;
      if (typeof layer.data !== 'undefined') {
        layerElement = $('<layer/>');
        writeITiledObjectBase(layerElement, layer);
        const dataElement: any = $('<data/>');

        // Validate data length
        const expectLength: number = this.width * this.height;
        if (layer.data.length !== expectLength) {
          throw new Error(errors.INVALID_ITEM);
        }

        // Only supports CSV. Add GZIP support some day.
        dataElement.attr('encoding', 'csv');
        dataElement.text(layer.data.join(','));
        layerElement.append(dataElement);
      }
      else if (typeof layer.objects !== 'undefined') {
        layerElement = $('<objectgroup/>');
        _.each(layer.objects, (obj: ITiledObject) => {
          const objectElement = $('<object/>');
          writeITiledObjectBase(objectElement, obj);
          writeTiledProperties(objectElement, obj.properties);
          layerElement.append(objectElement);
        });
      }
      else {
        throw new Error(errors.INVALID_ITEM);
      }
      writeITiledLayerBase(layerElement, layer);
      root.append(layerElement);
    });
    return this.xmlHeader + xml2Str(root[0]);
  }

  load(data?: any): Promise<Resource> {
    this.data = data || this.data;
    return new Promise<TiledTMXResource>((resolve, reject) => {
      this.$map = this.getRootNode('map');
      this.version = parseInt(this.getElAttribute(this.$map, 'version'), 10);
      this.width = parseInt(this.getElAttribute(this.$map, 'width'), 10);
      this.height = parseInt(this.getElAttribute(this.$map, 'height'), 10);
      this.orientation = this.getElAttribute(this.$map, 'orientation');
      this.tileheight = parseInt(this.getElAttribute(this.$map, 'tileheight'), 10);
      this.tilewidth = parseInt(this.getElAttribute(this.$map, 'tilewidth'), 10);
      this.properties = readTiledProperties(this.$map);
      const tileSetDeps: ITileSetDependency[] = [];
      const tileSets = this.getChildren(this.$map, 'tileset');
      const relativePath: string = this.url.substr(0, this.url.lastIndexOf('/') + 1);
      _.each(tileSets, (ts) => {
        const source: string = this.getElAttribute(ts, 'source');
        const firstGid: number = parseInt(this.getElAttribute(ts, 'firstgid') || '-1', 10);
        if (source) {
          tileSetDeps.push({
            source: compactUrl(relativePath, source),
            literal: source,
            firstgid: firstGid
          });
        }
        // Tileset element is inline, load from the existing XML and
        // assign the source (used for relative image loading) to be
        // the .tmx file.
        else {
          tileSetDeps.push({
            data: ts,
            source: relativePath,
            firstgid: firstGid
          });
        }
      });

      // Extract tile <layer>s and <objectgroup>s
      const layers = this.getChildren(this.$map, 'layer,objectgroup');
      let failed: boolean = false;
      _.each(layers, (layer) => {
        if (failed) {
          return;
        }
        const tileLayer: ITiledLayer = readITiledLayerBase(layer);
        this.layers.push(tileLayer);

        // Take CSV and convert it to JSON array, then parse.
        const layerData: any = this.getChild(layer, 'data');
        if (layerData) {
          const encoding: string = this.getElAttribute(layerData, 'encoding');
          if (!encoding || encoding.toLowerCase() !== 'csv') {
            failed = true;
            return reject(`pow-core only supports CSV maps. Edit the Map Properties (for:${this.url}) to use the CSV`);
          }
          tileLayer.data = JSON.parse('[' + $.trim(layerData.text()) + ']');
        }

        // Any custom color for this layer?
        const color: string = this.getElAttribute(layer, 'color');
        if (color) {
          tileLayer.color = color;
        }

        // Read any child objects
        const objects = this.getChildren(layer, 'object');
        if (objects) {
          tileLayer.objects = [];
          _.each(objects, (object) => {
            tileLayer.objects.push(readITiledObject(object));
          });
        }
      });

      // IF failed is set to true, the promise will already have been rejected, so we can return safely here.
      if (failed) {
        return;
      }

      // Load any source references.
      const _next = (): any => {
        if (tileSetDeps.length <= 0) {
          return resolve(this);
        }
        const dep = tileSetDeps.shift();
        if (dep.data) {
          new TiledTSXResource()
            .load(dep.data)
            .then((resource: TiledTSXResource) => {
              resource.relativeTo = relativePath;
              resource.firstgid = dep.firstgid;
              this.tilesets[resource.name] = resource;
              _next();
            })
            .catch((e) => reject(e));
        }
        else if (dep.source) {
          new TiledTSXResource()
            .fetch(dep.source)
            .then((resource: TiledTSXResource) => {
              this.tilesets[resource.name] = resource;
              resource.firstgid = dep.firstgid;
              resource.literal = dep.literal;
              _next();
            })
            .catch((e) => reject(e));
        }
        else {
          reject('Unknown type of tile set data');
        }
      };
      _next();
    });
  }
}
