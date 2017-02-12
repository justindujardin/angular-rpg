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
import * as _ from 'underscore';
import {errors} from './errors';
import {IResource} from './resource';
import {ImageResource} from './resources/image';
import {ScriptResource} from './resources/script';
import {JSONResource} from './resources/json';
import {XMLResource} from './resources/xml';
import {EntityFactory} from './resources/entities';
import {TiledTMXResource} from './resources/tiled/tiledTmx';
import {TiledTSXResource} from './resources/tiled/tiledTsx';
import {AudioResource} from './resources/audio';
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

/**
 * A basic resource loading manager.  Supports a basic api for requesting
 * resources by file name, and uses registered types and file extension
 * matching to create and load a resource.
 */
@Injectable()
export class ResourceLoader {
  private _cache: Object = {};
  private _types: Object = {
    'png': ImageResource,
    'js': ScriptResource,
    'json': JSONResource,
    'xml': XMLResource,
    'entities': EntityFactory,
    'tmx': TiledTMXResource,
    'tsx': TiledTSXResource,
    '': AudioResource,
    'mp3': AudioResource,
    'm4a': AudioResource,
    'aac': AudioResource,
    'ogg': AudioResource,
    'wav': AudioResource
  };

  constructor(public http: Http) {

  }

  /**
   * Register a custom resource class type
   * @param extension The extension without any period
   * @param type The class constructor function
   */
  registerType(extension: string, type: Function) {
    this._types[extension] = type;
  }

  getResourceExtension(url: string): string {
    const index: number = url.lastIndexOf('.');
    if (index === -1 || index <= url.lastIndexOf('/')) {
      return '';
    }
    return url.substr(index + 1);
  }

  create<T extends IResource>(typeConstructor: any, data?: any): T {
    if (typeof typeConstructor !== 'function') {
      throw new Error(errors.INVALID_ARGUMENTS);
    }
    return new typeConstructor(null, data) as any;
  }

  loadAsType<T extends IResource>(source: string, resourceType: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (!source || !resourceType) {
        return reject(errors.INVALID_ARGUMENTS);
      }
      let resource: T = this._cache[source];
      if (resource && resource.data) {
        return resolve(resource);
      }
      else if (!resource) {
        resource = this._cache[source] = new resourceType(source, null);
      }
      resource
        .fetch(source)
        .then(() => resolve(resource))
        .catch((e) => reject(e));
    });
  }

  load<T extends IResource|IResource[]>(sources: string[]): Promise<T[]>;
  load<T extends IResource|IResource[]>(sources: string[]): Promise<T[]>;
  load<T extends IResource|IResource[]>(source: string): Promise<T[]>;
  load<T extends IResource|IResource[]>(sources: any): Promise<T[]> {
    return new Promise<T|T[]>((resolve, reject) => {
      const results: T[] = [];
      let loadQueue: number = 0;
      let errors: number = 0;
      if (!_.isArray(sources)) {
        sources = [sources];
      }
      function _checkDone() {
        if (loadQueue === 0) {
          return (errors === 0) ? resolve(results) : reject(errors + ' resources failed to load');
        }
      }

      for (let i: number = 0; i < sources.length; i++) {
        let src: string = sources[i];
        let extension: string = this.getResourceExtension(src);
        let type: any = this._types[extension];
        if (!type) {
          errors++;
          continue;
        }
        loadQueue++;
        this
          .loadAsType<any>(src, this._types[extension])
          .then((resource: any) => {
            loadQueue--;
            _checkDone();
            resource.extension = extension;
            results.push(resource);
          })
          .catch((e) => {
            console.log(`failed to load resource (${src}) with error: ${e}`);
            errors++;
            loadQueue--;
            _checkDone();
          });
      }
      _checkDone();
    });
  }
}
