import {SceneObject} from './scene-object';
import {Behavior} from '../../pow-core/behavior';

/** Simplest component that is hosted by an object in a scene. */
export class SceneObjectBehavior extends Behavior {
  host: SceneObject;
}
