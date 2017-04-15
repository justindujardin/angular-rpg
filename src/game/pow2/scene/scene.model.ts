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
import {IObject, IBehaviorHost, IBehavior} from '../../pow-core/behavior';
import {IProcessObject} from '../../pow-core/time';
import {Point, IPoint} from '../../pow-core/point';
import {IEvents} from '../../pow-core/events';
import {IWorld} from '../../pow-core/world';
import {Rect} from '../../pow-core/rect';
/**
 * SceneObject interface
 */
export interface ISceneObject extends IObject, IProcessObject, IBehaviorHost {
  scene: IScene;
  enabled: boolean;
  point: IPoint;
  size: IPoint;
  onAddToScene?(scene: IScene);
}

export interface IScene extends IEvents {
  name: string;
  world: IWorld;
  fps: number;
  time: number;

  // View management
  // -----------------------------------------------------------------------------
  addView(view: ISceneView): boolean;
  removeView(view: ISceneView): boolean;
  findView(view: ISceneView): boolean;

  // SceneObject management
  // -----------------------------------------------------------------------------
  addObject(object: ISceneObject): boolean;
  removeObject(object: ISceneObject, destroy: boolean): boolean;
  findObject(object): boolean;

  // Component and object lookups
  componentByType(type): IBehavior;
  componentsByType(type): IBehavior[];
  objectsByName(name: string): ISceneObject[];
  objectByName(name: string): ISceneObject;
  objectsByType(type): ISceneObject[];
  objectByType(type): ISceneObject;
  objectsByComponent(type): ISceneObject[];
  objectByComponent(type): ISceneObject;
}

/**
 * A renderer object interface that is recognized by the
 * scene view.  [[SceneViewComponent]] is an implementation
 * of this interface that can be added to a [[SceneView]] and
 * will be invoked during the scene render.
 */
export interface ISceneViewRenderer {
  beforeFrame(view: ISceneView, elapsed: number);
  renderFrame(view: ISceneView, elapsed: number);
  afterFrame(view: ISceneView, elapsed: number);
}

/**
 * Renders a scene to a Canvas object.
 */
export interface ISceneView {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  camera: Rect;
  cameraComponent: any; // TODO: ICameraComponent
  cameraScale: number;
  unitSize: number;
  scene: IScene;

  // Scene rendering interfaces
  // -----------------------------------------------------------------------------
  renderToCanvas(width, height, renderFunction);

  // Render a frame. Subclass this to do your specific rendering.
  renderFrame(elapsed: number);
  // Render post effects
  renderPost();

  // Set the render state for this scene view.
  setRenderState();

  // Restore the render state to what it was before a call to setRenderState.
  restoreRenderState(): boolean;

  // Public render invocation.
  render(elapsed?: number);

  // Scene Camera updates
  // -----------------------------------------------------------------------------
  processCamera();

  // Scene rendering utilities
  // -----------------------------------------------------------------------------

  /**
   * Clear the view.
   */
  clearRect();

  // Coordinate Conversions (World/Screen)
  // -----------------------------------------------------------------------------

  // Convert a Rect/Point/Number from world coordinates (game units) to
  // screen coordinates (pixels)
  worldToScreen(value: Point, scale?): Point;
  worldToScreen(value: Rect, scale?): Rect;
  worldToScreen(value: number, scale?): number;
  worldToScreen(value: any, scale: number): any;

  // Convert a Rect/Point/Number from screen coordinates (pixels) to
  // game world coordinates (game unit sizes)
  screenToWorld(value: Point, scale?): Point;
  screenToWorld(value: Rect, scale?): Rect;
  screenToWorld(value: number, scale?): number;
  screenToWorld(value: any, scale: number): any;

  // Fast world to screen conversion, for high-volume usage situations.
  // avoid memory allocations.
  fastWorldToScreenPoint(value: Point, to: Point, scale: number): Point;
  fastWorldToScreenRect(value: Rect, to: Rect, scale: number): Rect;
  fastWorldToScreenNumber(value: number, scale: number): number;

  // Fast screen to world conversion, for high-volume usage situations.
  // avoid memory allocations.
  fastScreenToWorldPoint(value: Point, to: Point, scale: number): Point;
  fastScreenToWorldRect(value: Rect, to: Rect, scale: number): Rect;
  fastScreenToWorldNumber(value: number, scale: number): number;
}
