/*
 Copyright (C) 2013-2020 by Justin DuJardin and Contributors

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

import {
  IBehavior,
  IBehaviorHost,
  IObject,
  IProcessObject,
  IWorld,
  Point,
  Rect,
} from '../core';
import { IEvents } from '../core/events';

/**
 * SceneObject interface
 */
export interface ISceneObject extends IObject, IProcessObject, IBehaviorHost {
  scene: IScene | null;
  enabled: boolean;
  point: Point;
  size: Point;
  onAddToScene?(scene: IScene): void;
}

export interface IScene extends IEvents {
  name: string;
  world: IWorld | null;
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
  findObject(object: ISceneObject): boolean;

  // Component and object lookups
  componentByType<T extends IBehavior>(type: Function): T | null;
  componentsByType<T extends IBehavior>(type: Function): T[];
  objectsByName<T extends ISceneObject>(name: string): T[];
  objectByName<T extends ISceneObject>(name: string): T | null;
  objectsByType<T extends ISceneObject>(type: Function): T[];
  objectByType<T extends ISceneObject>(type: Function): T | null;
  objectsByComponent<T extends ISceneObject>(type: Function): T[];
  objectByComponent<T extends ISceneObject>(type: Function): T | null;
}

/**
 * A renderer object interface that is recognized by the
 * scene view.  [[SceneViewComponent]] is an implementation
 * of this interface that can be added to a [[SceneView]] and
 * will be invoked during the scene render.
 */
export interface ISceneViewRenderer {
  beforeFrame(view: ISceneView, elapsed: number): void;
  renderFrame(view: ISceneView, elapsed: number): void;
  afterFrame(view: ISceneView, elapsed: number): void;
}

/**
 * Renders a scene to a Canvas object.
 */
export interface ISceneView {
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  camera: Rect;
  cameraComponent: any; // TODO: ICameraComponent
  cameraScale: number;
  unitSize: number;
  scene: IScene | null;

  // Scene rendering interfaces
  // -----------------------------------------------------------------------------
  renderToCanvas(
    width: number,
    height: number,
    renderFunction: (ctx: CanvasRenderingContext2D) => void
  ): void;

  // Render a frame. Subclass this to do your specific rendering.
  renderFrame(elapsed: number): void;
  // Render post effects
  renderPost(): void;

  // Set the render state for this scene view.
  setRenderState(): void;

  // Restore the render state to what it was before a call to setRenderState.
  restoreRenderState(): boolean;

  // Public render invocation.
  render(elapsed?: number): void;

  // Scene Camera updates
  // -----------------------------------------------------------------------------
  processCamera(): void;

  // Scene rendering utilities
  // -----------------------------------------------------------------------------

  /**
   * Clear the view.
   */
  clearRect(): void;

  // Coordinate Conversions (World/Screen)
  // -----------------------------------------------------------------------------

  // Convert a Rect/Point/Number from world coordinates (game units) to
  // screen coordinates (pixels)
  worldToScreen(value: Point, scale?: number): Point;
  worldToScreen(value: Rect, scale?: number): Rect;
  worldToScreen(value: number, scale?: number): number;
  worldToScreen(value: any, scale: number): any;

  // Convert a Rect/Point/Number from screen coordinates (pixels) to
  // game world coordinates (game unit sizes)
  screenToWorld(value: Point, scale?: number): Point;
  screenToWorld(value: Rect, scale?: number): Rect;
  screenToWorld(value: number, scale?: number): number;
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