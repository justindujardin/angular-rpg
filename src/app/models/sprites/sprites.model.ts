import * as Immutable from 'immutable';

/**
 * Metadata about a sprite in a given sprite sheet.
 */
export interface SpriteData {
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

/**
 * A map of fileName -> Metadata pairs for a named sprite sheet.
 */
export type SpriteDataMap = Immutable.Map<string, SpriteData>;

/**
 * Sprite registry for looking up the sprite sheet metadata for a given texture in the `art/sprites`
 * folder. Duplicate items are not allowed.
 *
 * @note Sprites are referenced by filename, e.g. "shortSword.png" or "bluePotion.png"
 */
export interface SpriteState {
  spritesById: SpriteDataMap;
  loaded: boolean;
}
