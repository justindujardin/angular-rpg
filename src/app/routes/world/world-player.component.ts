import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SceneObjectBehavior } from '../../behaviors/scene-object-behavior';
import { Point, Rect } from '../../core';
import { Entity } from '../../models/entity/entity.model';
import { GameEntityObject } from '../../scene/objects/game-entity-object';
import {
  TileObjectRenderer,
  TileRenderable,
} from '../../scene/render/tile-object-renderer';
import { Scene } from '../../scene/scene';
import { SceneView } from '../../scene/scene-view';
import { ISceneViewRenderer } from '../../scene/scene.model';
import { TileMap } from '../../scene/tile-map';
import { CombatEncounterBehaviorComponent } from './behaviors/combat-encounter.behavior';
import { PlayerBehaviorComponent } from './behaviors/player-behavior';
import { PlayerCameraBehaviorComponent } from './behaviors/player-camera.behavior';
import { PlayerTriggerBehaviorComponent } from './behaviors/player-look.behavior';
import { PlayerMapPathBehaviorComponent } from './behaviors/player-map-path.behavior';
import { PlayerRenderBehaviorComponent } from './behaviors/player-render.behavior';
import { MapFeatureComponent } from './map-feature.component';

@Component({
  selector: 'world-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'world-player.component.html',
})
export class WorldPlayerComponent
  extends GameEntityObject
  implements AfterViewInit, OnDestroy, ISceneViewRenderer
{
  @ViewChildren('render,collision,path,player,trigger,camera,encounter')
  behaviors: QueryList<SceneObjectBehavior>;
  @Input() model: Entity | null;
  @Input() scene: Scene;
  @Input() map: TileMap;
  @Input() point: Point;

  /** For referencing in template */
  readonly self: WorldPlayerComponent = this;

  /** The fill color to use when rendering a path target. */
  targetFill: string = 'rgba(10,255,10,0.3)';
  /** The stroke to use when outlining path target. */
  targetStroke: string = 'rgba(10,255,10,0.3)';
  /** Line width for the path target stroke. */
  targetStrokeWidth: number = 1.5;

  @ViewChild(PlayerBehaviorComponent) movable: PlayerBehaviorComponent;

  constructor() {
    super();
  }

  ngAfterViewInit(): void {
    this.setSprite(this.model?.icon);
    this.scene.addObject(this);
    this.behaviors.forEach((c: SceneObjectBehavior) => {
      this.addBehavior(c);
    });
  }

  ngOnDestroy(): void {
    this.scene.removeObject(this);
    this.behaviors.forEach((c: SceneObjectBehavior) => {
      this.removeBehavior(c);
    });
    this.destroy();
  }

  /** The player has touched a game feature. */
  onFeatureLook(feature: MapFeatureComponent) {
    if (feature) {
      feature.enter(this);
      this.feature = feature;
    }
  }

  /** The player was touching a game feature, and is now leaving. */
  onFeatureLookAway(feature: MapFeatureComponent) {
    if (feature) {
      feature.exit(this);
    }
    this.feature = null;
  }

  private _featureComponent$ = new BehaviorSubject<MapFeatureComponent | null>(null);

  featureComponent$: Observable<MapFeatureComponent | null> = this._featureComponent$;

  get feature(): MapFeatureComponent | null {
    return this._featureComponent$.value;
  }

  set feature(value: MapFeatureComponent | null) {
    this._featureComponent$.next(value);
  }

  escapeFeature() {
    if (this.feature) {
      this.onFeatureLookAway(this.feature);
    }
  }

  //
  // ISceneViewRenderer
  //
  objectRenderer: TileObjectRenderer = new TileObjectRenderer();

  beforeFrame(view: SceneView, elapsed: number) {
    // Nope
  }

  /**
   * Render all of the map feature components
   */
  renderFrame(view: SceneView, elapsed: number) {
    // Render self
    const renderData: TileRenderable = {
      frame: this.frame,
      icon: this.icon,
      image: this.image,
      scale: this.scale,
      visible: this.visible,
      meta: this.meta,
    };
    if (this.altImage && this.altMeta && this.altIcon) {
      renderData.image = this.altImage;
      renderData.icon = this.altIcon;
      renderData.meta = this.altMeta;
    }
    this.objectRenderer.render(renderData, this.renderPoint || this.point, view);

    // Any path target
    if (this.movable && view.context) {
      const target = this.movable;
      if (this.movable.path && this.movable.path.length > 0) {
        view.context.save();
        const destination: Point = target.path[target.path.length - 1].clone();
        destination.x -= 0.5;
        destination.y -= 0.5;

        const screenTile: Rect = view.worldToScreen(
          new Rect(destination, new Point(1, 1))
        );
        view.context.fillStyle = this.targetFill;
        view.context.fillRect(
          screenTile.point.x,
          screenTile.point.y,
          screenTile.extent.x,
          screenTile.extent.y
        );
        view.context.strokeStyle = this.targetStroke;
        view.context.lineWidth = this.targetStrokeWidth;
        view.context.strokeRect(
          screenTile.point.x,
          screenTile.point.y,
          screenTile.extent.x,
          screenTile.extent.y
        );

        view.context.restore();
      }
    }
  }

  afterFrame(view: SceneView, elapsed: number) {
    // Nope
  }
}

/** Components associated with world player */
export const WORLD_PLAYER_COMPONENTS = [
  WorldPlayerComponent,
  CombatEncounterBehaviorComponent,
  PlayerBehaviorComponent,
  PlayerCameraBehaviorComponent,
  PlayerMapPathBehaviorComponent,
  PlayerRenderBehaviorComponent,
  PlayerTriggerBehaviorComponent,
];
