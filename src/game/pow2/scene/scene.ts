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
import {ISceneObject, ISceneView, IScene} from './scene.model';
import {IWorld, IWorldObject} from '../../pow-core/world';
import {SceneSpatialDatabase} from './scene-spatial-database';
import {IProcessObject} from '../../pow-core/time';
import {Events} from '../../pow-core/events';
import {IBehavior} from '../../pow-core/behavior';
import {GameWorld} from '../../../app/services/game-world';

export class Scene extends Events implements IScene, IProcessObject, IWorldObject {
  private static sceneCount: number = 0;
  id: string = `scene-${Scene.sceneCount++}`;
  name: string;
  db: SceneSpatialDatabase = new SceneSpatialDatabase();
  options: any = {};
  private _objects: ISceneObject[] = [];
  private _views: ISceneView[] = [];
  world: GameWorld = null;
  fps: number = 0;
  time: number = 0;
  paused: boolean = false;

  constructor(options: any = {}) {
    super();
    this.options = _.defaults(options || {}, {
      debugRender: false
    });
  }

  destroy() {
    let i;
    if (this.world) {
      this.world.erase(this);
    }
    let l: number = this._objects.length;
    for (i = 0; i < l; i++) {
      this.removeObject(this._objects[i], true);
    }
    l = this._views.length;
    for (i = 0; i < l; i++) {
      this.removeView(this._views[i]);
    }
    this.paused = true;
  }

  // IWorldObject
  // -----------------------------------------------------------------------------
  onAddToWorld(world: IWorld) {
    world.time.addObject(this);
  }

  onRemoveFromWorld(world: IWorld) {
    world.time.removeObject(this);
  }

  // IProcessObject
  // -----------------------------------------------------------------------------
  tick(elapsed: number) {
    if (this.paused) {
      return;
    }
    let l: number = this._objects.length;
    for (let i = 0; i < l; i++) {
      if (this._objects[i]) {
        this._objects[i].tick(elapsed);
      }
    }
  }

  processFrame(elapsed: number) {
    let i;
    if (this.paused) {
      return;
    }
    this.time = this.world.time.time;
    // Interpolate objects.
    let l: number = this._objects.length;
    for (i = 0; i < l; i++) {
      const o: any = this._objects[i];
      if (o.interpolateTick) {
        o.interpolateTick(elapsed);
      }
    }
    // Render frame.
    l = this._views.length;
    for (i = 0; i < l; i++) {
      this._views[i].render(elapsed);
    }
    // Update FPS
    const currFPS: number = elapsed ? 1000 / elapsed : 0;
    this.fps += (currFPS - this.fps) / 10;
  }

  // Object add/remove helpers.
  // -----------------------------------------------------------------------------
  removeIt(property: string, object: any): boolean {
    // Debugging Aid:
    // console.info(`Scene (${this.id}) - ${object._uid} = ${object}`);
    let removed: boolean = false;
    this[property] = _.filter(this[property], (obj: any) => {
      if (object && obj && obj._uid === object._uid) {
        this.db.removeSpatialObject(obj);
        if (obj.onRemoveFromScene) {
          obj.onRemoveFromScene(this);
        }
        if (this.world) {
          this.world.erase(obj);
        }
        delete obj.scene;
        removed = true;
        return false;
      }
      else if (!obj) {
        return false;
      }
      return true;
    });
    return removed;
  }

  addIt(property: string, object: any): boolean {
    // Debugging Aid:
    // console.info(`Scene (${this.id}) + ${object._uid} = ${object}`);

    // Remove object from any scene it might already be in.
    if (object.scene) {
      object.scene.removeIt(property, object);
    }

    // Check that we're not adding this twice (though, I suspect the above
    // should make that pretty unlikely)
    if (_.where(this[property], {_uid: object._uid}).length > 0) {
      throw new Error('Object added to scene twice');
    }
    this[property].push(object);
    // Mark it in the scene's world.
    if (this.world) {
      this.world.mark(object);
    }
    // Add to the scene's spatial database
    this.db.addSpatialObject(object);

    // Mark it in this scene, and trigger the onAdd
    object.scene = this;
    if (object.onAddToScene) {
      object.onAddToScene(this);
    }
    return true;
  }

  findIt(property: string, object: any): any {
    return _.where(this[property], {_uid: object._uid});
  }

  // View management
  // -----------------------------------------------------------------------------

  addView(view: ISceneView): boolean {
    return this.addIt('_views', view);
  }

  removeView(view: ISceneView): boolean {
    return this.removeIt('_views', view);
  }

  findView(view): boolean {
    return !!this.findIt('_views', view);
  }

  getViewOfType<T>(type: any): T {
    return _.find(this._views, (v: any) => {
      return v instanceof type;
    }) as T;
  }

  // SceneObject management
  // -----------------------------------------------------------------------------
  addObject(object: ISceneObject): boolean {
    return this.addIt('_objects', object);
  }

  removeObject(object: ISceneObject, destroy?: boolean): boolean {
    destroy = typeof destroy === 'undefined' ? true : !!destroy;
    const o: any = object;
    const removed: boolean = this.removeIt('_objects', object);
    if (o && destroy && o.destroy) {
      o.destroy();
    }
    return removed;
  }

  findObject(object: ISceneObject): boolean {
    return !!this.findIt('_objects', object);
  }

  componentByType(type): IBehavior {
    const values: any[] = this._objects;
    let l: number = this._objects.length;
    for (let i = 0; i < l; i++) {
      const o: ISceneObject = values[i];
      const c: IBehavior = o.findBehavior(type);
      if (c) {
        return c;
      }
    }
    return null;
  }

  componentsByType(type): IBehavior[] {
    const values: any[] = this._objects;
    let l: number = this._objects.length;
    let results: IBehavior[] = [];
    for (let i = 0; i < l; i++) {
      const o: ISceneObject = values[i];
      const c: IBehavior[] = o.findBehaviors(type);
      if (c) {
        results = results.concat(c);
      }
    }
    return results;
  }

  objectsByName(name: string): ISceneObject[] {
    const values: any[] = this._objects;
    let l: number = this._objects.length;
    const results: ISceneObject[] = [];
    for (let i = 0; i < l; i++) {
      const o: ISceneObject = values[i];
      if (o.name === name) {
        results.push(o);
      }
    }
    return results;
  }

  objectByName(name: string): ISceneObject {
    const values: any[] = this._objects;
    let l: number = this._objects.length;
    for (let i = 0; i < l; i++) {
      const o: ISceneObject = values[i];
      if (o.name === name) {
        return o;
      }
    }
    return null;
  }

  objectsByType(type): ISceneObject[] {
    const values: any[] = this._objects;
    let l: number = this._objects.length;
    let results: ISceneObject[] = [];
    for (let i = 0; i < l; i++) {
      const o: ISceneObject = values[i];
      if (o instanceof type) {
        results.push(o);
      }
    }
    return results;
  }

  objectByType(type): ISceneObject {
    let values: any[] = this._objects;
    let l: number = this._objects.length;
    for (let i = 0; i < l; i++) {
      const o: ISceneObject = values[i];
      if (o instanceof type) {
        return o;
      }
    }
    return null;
  }

  objectsByComponent(type): ISceneObject[] {
    let values: any[] = this._objects;
    let l: number = this._objects.length;
    const results: ISceneObject[] = [];
    for (let i = 0; i < l; i++) {
      const o: ISceneObject = values[i];
      if (o.findBehavior(type)) {
        results.push(o);
      }
    }
    return results;
  }

  objectByComponent(type): ISceneObject {
    const values: any[] = this._objects;
    const l: number = this._objects.length;
    for (let i = 0; i < l; i++) {
      const o: ISceneObject = values[i];
      if (o.findBehavior(type)) {
        return o;
      }
    }
    return null;
  }

  toString() {
    return this.constructor.name ? `${this.constructor.name} (${this.id})` : this.id;
  }
}
