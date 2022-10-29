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
import * as _ from 'underscore';
import { CameraBehavior } from '../behaviors/camera-behavior';
import { IRect, Point, Rect } from '../core';
import { TileMapRenderer } from './render/tile-map-renderer';
import { Scene } from './scene';
import { SceneObject } from './scene-object';
import { ISceneView } from './scene.model';
import { TileMap } from './tile-map';

/**
 * A view that renders a `Scene` through a given HTMLCanvasElement.
 *
 *  - a camera that can be moved, sized, and scaled
 *  - utilities for converting coordinates between World and Screen.
 *  - render decorators via [SceneViewComponent]
 *  - rendering a set of sprites with [spriteName].json files that describe
 *    the frames and timing.
 */
export class SceneView extends SceneObject implements ISceneView {
  static UNIT: number = 16;

  animations: any[] = [];
  context: CanvasRenderingContext2D;
  camera: Rect;
  cameraComponent: any = null; // TODO: ICameraComponent
  cameraScale: number;
  unitSize: number;
  scene: Scene = null;
  mapRenderer: TileMapRenderer = new TileMapRenderer();
  map: TileMap;
  /** Tell the view where the player is at. Useful for rendering. */
  focusPoint: Point = new Point();

  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  set canvas(value: HTMLCanvasElement) {
    this._canvas = value;
    if (!value) {
      this.context = this.canvas = null;
      return;
    }
    this.context = value.getContext('2d');
    if (!this.context) {
      throw new Error('SceneView: could not retrieve 2d Canvas context');
    }
    const context = this.context as any;
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    this.camera = new Rect(0, 0, 9, 9);
    this.cameraScale = 1.0;
    this.unitSize = SceneView.UNIT;
  }

  private _canvas: HTMLCanvasElement = null;

  // Scene rendering interfaces
  // -----------------------------------------------------------------------------

  renderToCanvas(width, height, renderFunction) {
    const buffer = document.createElement('canvas');
    buffer.width = width;
    buffer.height = height;
    const context: any = buffer.getContext('2d');
    // Disable smoothing for nearest neighbor scaling.
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    renderFunction(context);
    return buffer;
  }

  /**
   * The map view bounds in world space.
   */
  protected _bounds: Point = new Point();

  public _onResize(event?: Event) {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._bounds.set(this.canvas.width, this.canvas.height);
    this._bounds = this.screenToWorld(this._bounds);
    const context: any = this.context;
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
  }

  /*
   * Get the camera clip rectangle.
   * @returns {Rect}
   */
  getCameraClip() {
    if (!this.map) {
      return this.camera;
    }
    const clipGrow = this.camera.clone();
    clipGrow.point.round();
    clipGrow.extent.round();

    // Clamp to tilemap bounds.
    const rect: IRect = this.map.bounds;
    if (clipGrow.point.x < rect.point.x) {
      // NOTE: -1 here because the rendering is offset by half a tile (center origin)
      clipGrow.point.x += rect.point.x - 1 - clipGrow.point.x;
    }
    if (clipGrow.point.y < rect.point.y) {
      // NOTE: -1 here because the rendering is offset by half a tile (center origin)
      clipGrow.point.y += rect.point.y - 1 - clipGrow.point.y;
    }
    if (clipGrow.point.x + clipGrow.extent.x > rect.point.x + rect.extent.x) {
      clipGrow.point.x -=
        clipGrow.point.x + clipGrow.extent.x - (rect.point.x + rect.extent.x);
    }
    if (clipGrow.point.y + clipGrow.extent.y > rect.point.y + rect.extent.y) {
      clipGrow.point.y -=
        clipGrow.point.y + clipGrow.extent.y - (rect.point.y + rect.extent.y);
    }
    return clipGrow;
  }

  /*
   * Set the pre-render canvas state.
   */
  setRenderState() {
    if (!this.context) {
      return;
    }
    this.context.save();
    this.context.scale(this.cameraScale, this.cameraScale);
    if (!this.camera || !this.context || !this.map) {
      return;
    }
    let worldCameraPos = this.worldToScreen(this.camera.point);
    let worldTilePos = this.worldToScreen(this.map.bounds.point);
    worldTilePos.x = parseFloat(worldTilePos.x.toFixed(2));
    worldTilePos.y = parseFloat(worldTilePos.y.toFixed(2));
    worldCameraPos.x = parseFloat(worldCameraPos.x.toFixed(2));
    worldCameraPos.y = parseFloat(worldCameraPos.y.toFixed(2));
    this.context.translate(
      worldTilePos.x - worldCameraPos.x,
      worldTilePos.y - worldCameraPos.y
    );
  }

  /*
   * Render the tile $map, and any features it has.
   */
  renderFrame(elapsed: number) {
    this.clearRect();
    if (!this.map) {
      return;
    }
    this.mapRenderer.render(this.map, this);
    return this;
  }

  // Render post effects
  renderPost() {
    const clip = this.worldToScreen(this.getCameraClip());
    const center = this.worldToScreen(this.focusPoint);

    if (this.map.dark) {
      this.context.rect(clip.point.x, clip.point.y, clip.extent.x, clip.extent.y);
      // create radial gradient
      const outerRadius = 100;
      const innerRadius = 10;
      const gradient = this.context.createRadialGradient(
        center.x,
        center.y,
        innerRadius,
        center.x,
        center.y,
        outerRadius
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,1)');
      this.context.fillStyle = gradient;
      this.context.fill();
    }
    // nothing
  }

  // Restore the render state to what it was before a call to setRenderState.
  restoreRenderState(): boolean {
    if (!this.context) {
      return false;
    }
    this.context.restore();
    return true;
  }

  // Public render invocation.
  render() {
    this._render(0);
  }

  // Render the scene
  _render(elapsed: number) {
    this.processCamera();
    this.setRenderState();
    this.renderFrame(elapsed);
    this.renderAnimations();
    this.renderPost();
    this.restoreRenderState();
  }

  // Scene Camera updates
  // -----------------------------------------------------------------------------
  /*
   * Update the camera for this frame.
   */
  processCamera() {
    this.cameraComponent = this.findBehavior(CameraBehavior) as CameraBehavior;
    if (!this.cameraComponent && this.map) {
      this.cameraComponent = this.map.findBehavior(CameraBehavior) as CameraBehavior;
    }
    if (!this.cameraComponent) {
      this.cameraComponent = this.scene.componentByType(
        CameraBehavior
      ) as CameraBehavior;
    }
    if (this.cameraComponent) {
      this.cameraComponent.process(this);
    }
  }
  // Scene rendering utilities
  // -----------------------------------------------------------------------------

  clearRect() {
    let renderPos;
    let x = 0;
    let y = 0;
    if (this.camera) {
      renderPos = this.worldToScreen(this.camera.point);
      x = renderPos.x;
      y = renderPos.y;
    }
    return this.context.clearRect(
      x,
      y,
      this.context.canvas.width,
      this.context.canvas.height
    );
  }

  // Coordinate Conversions (World/Screen)
  // -----------------------------------------------------------------------------

  // Convert a Rect/Point/Number from world coordinates (game units) to
  // screen coordinates (pixels)
  worldToScreen(value: Point, scale?): Point;
  worldToScreen(value: Rect, scale?): Rect;
  worldToScreen(value: number, scale?): number;
  worldToScreen(value: any, scale = 1): any {
    if (value instanceof Rect) {
      const result: Rect = new Rect(value);
      result.point.multiply(this.unitSize * scale);
      result.extent.multiply(this.unitSize * scale);
      return result;
    } else if (value instanceof Point) {
      return new Point(value).multiply(this.unitSize * scale);
    }
    return value * (this.unitSize * scale);
  }

  // Convert a Rect/Point/Number from screen coordinates (pixels) to
  // game world coordinates (game unit sizes)
  screenToWorld(value: Point, scale?): Point;
  screenToWorld(value: Rect, scale?): Rect;
  screenToWorld(value: number, scale?): number;
  screenToWorld(value: any, scale = 1): any {
    if (value instanceof Rect) {
      const result: Rect = new Rect(value);
      result.point.multiply(1 / (this.unitSize * scale));
      result.extent.multiply(1 / (this.unitSize * scale));
      return result;
    } else if (value instanceof Point) {
      return new Point(value).multiply(1 / (this.unitSize * scale));
    }
    return value * (1 / (this.unitSize * scale));
  }

  // Fast world to screen conversion, for high-volume usage situations.
  // avoid memory allocations.
  fastWorldToScreenPoint(value: Point, to: Point, scale = 1): Point {
    to.set(value);
    to.multiply(this.unitSize * scale);
    return to;
  }

  fastWorldToScreenRect(value: Rect, to: Rect, scale = 1): Rect {
    to.set(value);
    to.point.multiply(this.unitSize * scale);
    to.extent.multiply(this.unitSize * scale);
    return to;
  }

  fastWorldToScreenNumber(value: number, scale = 1): number {
    return value * (this.unitSize * scale);
  }

  // Fast screen to world conversion, for high-volume usage situations.
  // avoid memory allocations.
  fastScreenToWorldPoint(value: Point, to: Point, scale = 1): Point {
    to.set(value);
    to.multiply(1 / (this.unitSize * scale));
    return to;
  }

  fastScreenToWorldRect(value: Rect, to: Rect, scale = 1): Rect {
    to.set(value);
    to.point.multiply(1 / (this.unitSize * scale));
    to.extent.multiply(1 / (this.unitSize * scale));
    return to;
  }

  fastScreenToWorldNumber(value: number, scale = 1): number {
    return value * (1 / (this.unitSize * scale));
  }

  // Animations
  // -----------------------------------------------------------------------------
  renderAnimations() {
    const len: number = this.animations.length;
    for (let i = 0; i < len; i++) {
      let animation = this.animations[i];
      animation.done = animation.fn(animation.frame);
      if (this.scene.time >= animation.time) {
        animation.frame += 1;
        animation.time = this.scene.time + animation.rate;
      }
    }
    return (this.animations = _.filter(this.animations, (a: any) => {
      return a.done !== true;
    }));
  }
}
