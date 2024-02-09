import * as _ from 'underscore';
import { ImageResource } from '../core';
import { ISpriteMeta } from '../core/api';
import { assertTrue } from '../models/util';
import { TileObject } from '../scene/tile-object';
import { SceneObjectBehavior } from './scene-object-behavior';

export interface SpriteComponentOptions {
  icon: string;
  image?: HTMLImageElement;
  name?: string;
  frame?: number;
  meta?: ISpriteMeta;
}

export class SpriteComponent extends SceneObjectBehavior {
  host: TileObject;
  image: HTMLImageElement;
  visible: boolean;
  enabled: boolean;

  // Game Sprite support.
  // ----------------------------------------------------------------------
  // The sprite name, e.g. "entity.png" or "knight.png"
  icon: string | null;
  // The sprite sheet source information
  meta: ISpriteMeta | null;
  // The sprite frame (if applicable)
  frame: number = 0;

  get scale(): number {
    return this.host ? this.host.scale : 1;
  }

  constructor(options?: SpriteComponentOptions) {
    super();
    if (typeof options !== 'undefined') {
      _.extend(this, options);
    }
  }

  syncBehavior(): boolean {
    if (this.host.world) {
      this.setSprite(this.icon, this.frame);
    }
    return super.syncBehavior();
  }

  /**
   * Set the current sprite name.  Returns the previous sprite name.
   */
  async setSprite(name: string | null = null, frame?: number): Promise<string | null> {
    if (name && name === this.icon && this.image && this.meta) {
      return this.icon;
    }
    if (typeof frame !== 'undefined') {
      this.frame = frame;
    }
    this.icon = name;
    if (!name) {
      this.meta = null;
      return null;
    }
    this.meta = this.host.world.sprites.getSpriteMeta(name);
    assertTrue(this.meta?.source, `invalid sprite source: ${name}`);
    const images: ImageResource[] = await this.host.world.sprites.getSpriteSheet(
      this.meta.source,
    );
    this.image = images[0].data;
    return this.icon;
  }
}
