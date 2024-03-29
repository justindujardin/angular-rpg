import * as _ from 'underscore';
import { IBehavior, IProcessObject, IWorld, IWorldObject } from '../core';
import { GameWorld } from '../services/game-world';
import { IScene, ISceneObject, ISceneView } from './scene.model';
import { SceneSpatialDatabase } from './spatial-database';

export class Scene implements IScene, IProcessObject, IWorldObject, IScene {
  private static sceneCount: number = 0;
  id: string = `scene-${Scene.sceneCount++}`;
  name: string;
  db: SceneSpatialDatabase = new SceneSpatialDatabase();
  options: any = {};
  private _objects: ISceneObject[] = [];
  private _views: ISceneView[] = [];
  world: GameWorld | null = null;
  fps: number = 0;
  time: number = 0;
  paused: boolean = false;

  constructor(options: any = {}) {
    this.options = _.defaults(options || {}, {
      debugRender: false,
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
      const obj = this._objects[i];
      if (obj?.tick) {
        obj.tick(elapsed);
      }
    }
  }

  processFrame(elapsed: number) {
    let i;
    if (this.paused) {
      return;
    }
    this.time = this.world?.time?.time || -1;
    // Interpolate objects.
    let l: number = this._objects.length;
    for (i = 0; i < l; i++) {
      const o: any = this._objects[i];
      if (o.enabled && o.interpolateTick) {
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
    const target = this as any;
    target[property] = _.filter(target[property], (obj: any) => {
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
      } else if (!obj) {
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
    const target = this as any;
    if (_.where(target[property], { _uid: object._uid }).length > 0) {
      throw new Error('Object added to scene twice');
    }
    target[property].push(object);
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
    const target = this as any;
    return _.where(target[property], { _uid: object._uid });
  }

  // View management
  // -----------------------------------------------------------------------------

  addView(view: ISceneView): boolean {
    return this.addIt('_views', view);
  }

  removeView(view: ISceneView): boolean {
    return this.removeIt('_views', view);
  }

  findView(view: ISceneView): boolean {
    return !!this.findIt('_views', view);
  }

  getViewOfType<T extends ISceneView>(type: any): T {
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

  componentByType<T extends IBehavior>(type: Function): T | null {
    const values: any[] = this._objects;
    let l: number = this._objects.length;
    for (let i = 0; i < l; i++) {
      const o: ISceneObject = values[i];
      const c: T | null = o.findBehavior<T>(type);
      if (c) {
        return c;
      }
    }
    return null;
  }

  componentsByType<T extends IBehavior>(type: Function): T[] {
    const values: any[] = this._objects;
    let l: number = this._objects.length;
    let results: T[] = [];
    for (let i = 0; i < l; i++) {
      const o: ISceneObject = values[i];
      const c: T[] = o.findBehaviors(type);
      if (c) {
        results = results.concat(c);
      }
    }
    return results;
  }

  objectsByName<T extends ISceneObject>(name: string): T[] {
    const values: any[] = this._objects;
    let l: number = this._objects.length;
    const results: T[] = [];
    for (let i = 0; i < l; i++) {
      const o: T = values[i];
      if (o.name === name) {
        results.push(o);
      }
    }
    return results;
  }

  objectByName<T extends ISceneObject>(name: string): T | null {
    const values: any[] = this._objects;
    let l: number = this._objects.length;
    for (let i = 0; i < l; i++) {
      const o: T = values[i];
      if (o.name === name) {
        return o;
      }
    }
    return null;
  }

  objectsByType<T extends ISceneObject>(type: Function): T[] {
    const values: any[] = this._objects;
    let l: number = this._objects.length;
    let results: T[] = [];
    for (let i = 0; i < l; i++) {
      const o: T = values[i];
      if (o instanceof type) {
        results.push(o);
      }
    }
    return results;
  }

  objectByType<T extends ISceneObject>(type: Function): T | null {
    let values: any[] = this._objects;
    let l: number = this._objects.length;
    for (let i = 0; i < l; i++) {
      const o: T = values[i];
      if (o instanceof type) {
        return o;
      }
    }
    return null;
  }

  objectsByComponent<T extends ISceneObject>(type: Function): T[] {
    let values: any[] = this._objects;
    let l: number = this._objects.length;
    const results: T[] = [];
    for (let i = 0; i < l; i++) {
      const o: T = values[i];
      if (o.findBehavior(type)) {
        results.push(o);
      }
    }
    return results;
  }

  objectByComponent<T extends ISceneObject>(type: Function): T | null {
    const values: any[] = this._objects;
    const l: number = this._objects.length;
    for (let i = 0; i < l; i++) {
      const o: T = values[i];
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
