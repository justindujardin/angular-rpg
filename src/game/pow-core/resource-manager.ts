import * as _ from 'underscore';
import {errors} from './errors';
import {IResource} from './resource';
import {ImageResource} from './resources/image.resource';
import {JSONResource} from './resources/json.resource';
import {XMLResource} from './resources/xml.resource';
import {TiledTMXResource} from './resources/tiled/tiled-tmx.resource';
import {TiledTSXResource} from './resources/tiled/tiled-tsx.resource';
import {AudioResource} from './resources/audio.resource';
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

/**
 * A basic resource loading manager with api for requesting
 * resources by file name. Uses registered types and file extension
 * matching to create and load resources.
 */
@Injectable()
export class ResourceManager {
  private _cache: Object = {};
  private _types: Object = {
    'png': ImageResource,
    'json': JSONResource,
    'xml': XMLResource,
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

  /**
   * Load a single resource as the given resource type constructor.
   */
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

  /**
   * Load one or more resources from a given url or list of urls. The type of each resource is determined
   * by matching of its filename against the list of known resource types.
   *
   * @returns An array of IResource objects.
   */
  load<T extends IResource | IResource[]>(sources: string | string[]): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
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
