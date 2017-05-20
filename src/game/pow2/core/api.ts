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

/**
 * Metadata about a sprite in a given sprite sheet.
 */
export interface ISpriteMeta {
  /** Pixel width */
  readonly width: number;
  /** Pixel height */
  readonly height: number;
  /** The number of frames the sprite has. */
  readonly frames: number;
  /** The spritesheet source map */
  readonly source: string;
  /** */
  readonly index: number | null;
  /** Pixel offset x in the sprite sheet. */
  readonly x: number;
  /** Pixel offset y in the sprite sheet. */
  readonly y: number;
  /** Optional frame width (defaults to 16px) */
  readonly cellWidth: number;
  /** Optional frame height (defaults to 16px) */
  readonly cellHeight: number;
}

export const data = {
  sprites: {}
};

/**
 * Register a dictionary of sprite meta data.  This is for automatically
 * generated sprite sheets, and only defaults to setting information if
 * it has not already been set by a call to describeSprites.
 * @deprecated TODO: remove this by updating code to reference the data in ngrx/store
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
