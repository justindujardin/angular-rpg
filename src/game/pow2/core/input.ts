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
import {SceneView} from '../scene/scene-view';
import {Point} from '../../pow-core/point';
import {IWorld, IWorldObject} from '../../pow-core/world';

export enum KeyCode {
  UP = 38,
  DOWN = 40,
  LEFT = 37,
  RIGHT = 39,
  BACKSPACE = 8,
  COMMA = 188,
  DELETE = 46,
  END = 35,
  ENTER = 13,
  ESCAPE = 27,
  HOME = 36,
  SPACE = 32,
  TAB = 9
}

export interface CanvasMouseCoords {
  point: Point; // Point on the canvas in pixels.
  world: Point; // Point in the world, accounting for camera scale and offset.
}

export interface NamedMouseElement extends CanvasMouseCoords {
  name: string;
  view: SceneView;
}

export class PowInput implements IWorldObject {
  world: IWorld;
  _keysDown: Object = {};
  _mouseElements: NamedMouseElement[] = [];

  static mouseOnView(ev: MouseEvent, view: SceneView, coords?: CanvasMouseCoords) {
    const relativeElement: any = ev.srcElement;
    const touches: any = (<any> ev).touches;
    if (touches && touches.length > 0) {
      ev = <any> touches[0];
    }
    const result: CanvasMouseCoords = coords || {
        point: new Point(),
        world: new Point()
      };
    const canoffset = $(relativeElement).offset();
    const x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
    const y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top);
    result.point.set(x, y);
    // Generate world mouse position
    const worldMouse = view.screenToWorld(result.point, view.cameraScale).add(view.camera.point).round();
    result.world.set(worldMouse.x, worldMouse.y);
    return result;
  }

  constructor() {
    window.addEventListener('keydown', (ev: KeyboardEvent) => {
      this._keysDown[ev.which] = true;
    });
    window.addEventListener('keyup', (ev: KeyboardEvent) => {
      this._keysDown[ev.which] = false;
    });
    const hooks = this._mouseElements;
    window.addEventListener('mousemove touchmove', (ev: MouseEvent) => {
      let l: number = hooks.length;
      for (let i = 0; i < l; i++) {
        const hook: NamedMouseElement = hooks[i];
        if (ev.srcElement === hook.view.canvas) {
          PowInput.mouseOnView(ev, hook.view, hook);
        }
        else {
          hook.point.set(-1, -1);
          hook.world.set(-1, -1);
        }
      }
    });
  }

  mouseHook(view: SceneView, name: string): NamedMouseElement {
    const hooks = _.where(this._mouseElements, {name}) as NamedMouseElement[];
    const result: NamedMouseElement = {
      name,
      view,
      point: new Point(-1, -1),
      world: new Point(-1, -1)
    };
    // Overwrite any existing hook with a conflicting name
    if (hooks.length > 0) {
      hooks[0] = result;
    }
    else {
      this._mouseElements.push(result);
    }
    return result;
  }

  mouseUnhook(nameOrView: string | SceneView) {
    this._mouseElements = _.filter(this._mouseElements, (hook: NamedMouseElement) => {
      return nameOrView instanceof SceneView ? hook.view._uid === nameOrView._uid : hook.name === nameOrView;
    });
  }

  getMouseHook(nameOrView: string | SceneView): NamedMouseElement {
    return _.find(this._mouseElements, (hook: NamedMouseElement) => {
      return nameOrView instanceof SceneView ? hook.view._uid === nameOrView._uid : hook.name === nameOrView;
    }) as NamedMouseElement;
  }

  keyDown(key: number): boolean {
    return !!this._keysDown[key];
  }

}
