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
import * as _ from 'underscore';
import {Resource} from '../../../game/pow-core/resource';
declare var Tabletop: any;
/**
 * Use TableTop to load a published google spreadsheet.
 */
export class GameDataResource extends Resource {

  fetch(url?: string): Promise<GameDataResource> {
    return new Promise<GameDataResource>((resolve, reject) => {
      Tabletop.init({
        key: url,
        callback: (data, tabletop) => {
          data = this.data = this.transformTypes(data);
          resolve(this);
        }
      });
    });
  }

  // TODO: Do we need to match - and floating point?
  static NUMBER_MATCHER: RegExp = /^-?\d+$/;

  // TODO: More sophisticated deserializing of types, removing hardcoded keys.
  transformTypes(data: any): any {
    const results: any = {};
    _.each(data, (dataValue: any, dataKey: any) => {
      const sheetElements = dataValue.elements.slice(0);
      const length: number = sheetElements.length;
      for (let i = 0; i < length; i++) {
        const entry: any = sheetElements[i];
        for (let key in entry) {
          if (!entry.hasOwnProperty(key) || typeof entry[key] !== 'string') {
            continue;
          }
          const value = entry[key];
          // number values
          if (value.match(GameDataResource.NUMBER_MATCHER)) {
            entry[key] = parseInt(value, 10);
          }
          // boolean values
          else if (key === 'benefit') {
            switch (value.toLowerCase()) {
              case 'true':
              case 'yes':
              case '1':
                entry[key] = true;
                break;
              case 'false':
              case 'no':
              case '0':
              case null:
                entry[key] = false;
                break;
              default:
                entry[key] = Boolean(value);
            }
          }
          // pipe delimited array values
          else if (key === 'usedby' || key === 'groups' || key === 'message' || key === 'zones' || key === 'enemies') {
            if (/^\s*$/.test(value)) {
              entry[key] = null;
            }
            else {
              entry[key] = value.split('|');
            }
          }
        }
      }
      results[dataKey.toLowerCase()] = sheetElements;
    });
    return results;
  }
}
