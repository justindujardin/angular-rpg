import { Behavior } from '../../app/core/behavior';
import { SceneObject } from '../scene/scene-object';

/** Simplest component that is hosted by an object in a scene. */
export class SceneObjectBehavior extends Behavior {
  host: SceneObject;
}
