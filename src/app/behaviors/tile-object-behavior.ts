
import { EventEmitter } from '@angular/core';
import { TileMap } from '../scene/tile-map';
import { TileObject } from '../scene/tile-object';
import { SceneObjectBehavior } from './scene-object-behavior';
export class TileObjectBehavior extends SceneObjectBehavior {
  host: TileObject | null;
  isEntered: boolean;

  /** Emitted when a player has entered this tile */
  onEntered$ = new EventEmitter();
  /** Emitted when a player has exited this tile */
  onExited$ = new EventEmitter();

  syncBehavior(): boolean {
    return !!(this.host?.tileMap instanceof TileMap);
  }

  disconnectBehavior(): boolean {
    return true;
  }

  enter(object: TileObject): boolean {
    return true;
  }

  entered(object: TileObject) {
    this.onEntered$.emit(this);
    this.isEntered = true;
    return true;
  }

  exit(object: TileObject): boolean {
    return true;
  }

  exited(object: TileObject) {
    this.onExited$.emit(this);
    this.isEntered = false;
    return true;
  }
}
