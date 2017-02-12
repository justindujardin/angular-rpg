import {SceneObject} from './sceneObject';
import {Behavior} from '../../pow-core/behavior';

/** Simplest component that is hosted by an object in a scene. */
export class SceneComponent extends Behavior {
  host: SceneObject;
}
