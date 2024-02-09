
import * as _ from 'underscore';

export const NAME: string = 'core';

/**
 * Specified root path.  Used when loading game asset files, to support cross-domain usage.
 */
export const GAME_ROOT: string = 'assets/';

export function getMapUrl(name: string): string {
  if (!name.endsWith('.tmx')) {
    name = `${name}.tmx`;
  }
  return `${GAME_ROOT}maps/${name}`;
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
  /** The source icon for this image */
  readonly image: string;
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

export const data: { sprites: { [key: string]: ISpriteMeta } } = {
  sprites: {},
};

/**
 * Register a dictionary of sprite meta data.  This is for automatically
 * generated sprite sheets, and only defaults to setting information if
 * it has not already been set by a call to describeSprites.
 * @deprecated TODO: remove this by updating code to reference the data in ngrx/store
 */
export function registerSprites(name: string, value: { [key: string]: any }) {
  for (let prop in value) {
    data.sprites[prop] = _.defaults(data.sprites[prop] || {}, value[prop]);
  }
}

export function getSpriteMeta(name: string): ISpriteMeta {
  return data.sprites[name] as ISpriteMeta;
}
