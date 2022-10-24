import { Behavior } from '../../game/pow-core/behavior';
import { SceneObject } from '../../game/pow2/scene/scene-object';

/** Simplest component that is hosted by an object in a scene. */
export class SceneObjectBehavior extends Behavior {
  host: SceneObject;
}
