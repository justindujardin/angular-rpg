import { ElementRef } from '@angular/core';
import { Point } from '../../core';
import { GameEntityObject } from '../../scene/game-entity-object';

/**
 * Attach an HTML element to the position of a game object.
 */
export interface UIAttachment {
  object: GameEntityObject;
  offset: Point;
  element: ElementRef;
}
