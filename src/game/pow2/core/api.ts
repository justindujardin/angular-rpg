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

/**
 * The Google Spreadsheet ID to load game data from.  This must be a published
 * google spreadsheet key.
 * @type {string} The google spreadsheet ID
 */
export const SPREADSHEET_ID: string = '1IAQbt_-Zq1BUwRNiJorvt4iPEYb5HmZrpyMOkb-OuJo';

export const NAME: string = 'core';

/**
 * Specified root path.  Used when loading game asset files, to support cross-domain usage.
 */
export const GAME_ROOT: string = 'assets/';

export function getMapUrl(name: string): string {
  return `${GAME_ROOT}maps/${name}.tmx`;
}

export function getSoundEffectUrl(name: string, extension: string = 'wav'): string {
  return `${GAME_ROOT}sounds/${name}.${extension}`;
}

export interface ISpriteMeta {
  width: number; // Pixel width
  height: number; // Pixel height
  cellWidth?: number; // Optional frame width (defaults to 16px)
  cellHeight?: number; // Optional frame height (defaults to 16px)
  frames: number; // The number of frames the sprite has.
  source: string; // The spritesheet source map
  x: number; // Pixel offset x in the sprite sheet.
  y: number; // Pixel offset y in the sprite sheet.
}

export const data = {
  maps: {},
  sprites: {},
  items: {},
  creatures: [],
  weapons: [],
  armor: []
};

/**
 * Register data on the pow2 module.
 * @param {String} key The key to store the value under
 * @param {*} value The value
 */
export function registerData(key: string, value: any) {
  data[key] = value;
}

export function getData(key: string): any {
  return data[key];
}

export function registerMap(name: string, value: Object) {
  data.maps[name] = value;
}

/**
 * Describe a dictionary of sprites.  This can be use to
 */
export function describeSprites(value: Object) {
  for (let prop in value) {
    if (value.hasOwnProperty(prop)) {
      data.sprites[prop] = _.extend(data.sprites[prop] || {}, value[prop]);
    }
  }
}

/**
 * Register a dictionary of sprite meta data.  This is for automatically
 * generated sprite sheets, and only defaults to setting information if
 * it has not already been set by a call to describeSprites.
 */
export function registerSprites(name: string, value: Object) {
  for (let prop in value) {
    if (value.hasOwnProperty(prop)) {
      data.sprites[prop] = _.defaults(data.sprites[prop] || {}, value[prop]);
    }
  }
}

export function getSpriteMeta(name: string): ISpriteMeta {
  return data.sprites[name] as ISpriteMeta;
}

export function registerCreatures(level, creatures) {
  _.each(creatures, (c) => {
    data.creatures.push(_.extend(c, {level}));
  });
}

export function getMap(name: string) {
  return data.maps[name];
}

export function getMaps() {
  return data.maps;
}
