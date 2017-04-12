import {
  Component,
  AfterViewInit,
  ViewChildren,
  QueryList,
  OnDestroy,
  Input,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import {GameEntityObject} from '../../../../game/rpg/objects/gameEntityObject';
import {CombatPlayerRenderBehaviorComponent} from './behaviors/combat-player-render.behavior';
import {SceneComponent} from '../../../../game/pow2/scene/sceneComponent';
import {CombatAttackBehaviorComponent} from './behaviors/actions/combat-attack.behavior';
import {CombatComponent} from './combat.component';
import {Entity} from '../../../models/entity/entity.model';
import {GameTileMap} from '../../../../game/gameTileMap';
import {CombatEncounterBehaviorComponent} from '../behaviors/combat-encounter.behavior';
import {PlayerBehaviorComponent} from '../behaviors/player-behavior';
import {PlayerCameraBehaviorComponent} from '../behaviors/player-camera.behavior';
import {PlayerMapPathBehaviorComponent} from '../behaviors/player-map-path.behavior';
import {PlayerRenderBehaviorComponent} from '../behaviors/player-render.behavior';
import {PlayerTriggerBehaviorComponent} from '../behaviors/player-look.behavior';
import {Scene} from '../../../../game/pow2/scene/scene';
import {Point} from '../../../../game/pow-core/point';
import {ISceneViewRenderer} from '../../../../game/pow2/interfaces/IScene';
import {SceneView} from '../../../../game/pow2/scene/sceneView';
import {TileObjectRenderer} from '../../../../game/pow2/tile/render/tileObjectRenderer';
import {Rect} from '../../../../game/pow-core/rect';
import {GameFeatureObject} from '../../../../game/rpg/objects/gameFeatureObject';
import {TiledFeatureComponent} from './map-feature.component';
import {Observable, BehaviorSubject} from 'rxjs';

@Component({
  selector: 'world-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <player-render-behavior #render></player-render-behavior>
  <collision-behavior #collision></collision-behavior>
  <player-map-path-behavior [tileMap]="map" #path></player-map-path-behavior>
  <player-behavior #player></player-behavior>
  <player-camera-behavior #camera></player-camera-behavior>
  <player-look-behavior
    (onLook)="onFeatureLook($event)"
    (onLookAway)="onFeatureLookAway($event)"
    #trigger></player-look-behavior>
  <ng-content></ng-content>
`
})
export class WorldPlayerComponent extends GameEntityObject implements AfterViewInit, OnDestroy, ISceneViewRenderer {
  @ViewChildren('render,collision,path,player,trigger,camera') behaviors: QueryList<SceneComponent>;

  @Input() model: Entity;
  @Input() scene: Scene;
  @Input() map: GameTileMap;
  @Input() point: Point;

  /** The fill color to use when rendering a path target. */
  targetFill: string = 'rgba(10,255,10,0.3)';
  /** The stroke to use when outlining path target. */
  targetStroke: string = 'rgba(10,255,10,0.3)';
  /** Line width for the path target stroke. */
  targetStrokeWidth: number = 1.5;

  @ViewChild(PlayerBehaviorComponent) movable: PlayerBehaviorComponent;

  ngAfterViewInit(): void {
    this.setSprite(this.model.icon);
    this.scene.addObject(this);
    this.behaviors.forEach((c: SceneComponent) => {
      this.addBehavior(c);
    });
  }

  ngOnDestroy(): void {
    this.scene.removeObject(this);
    this.behaviors.forEach((c: SceneComponent) => {
      this.removeBehavior(c);
    });
    this.destroy();
  }

  /** The player has touched a game feature. */
  onFeatureLook(event: GameFeatureObject) {
    const feature = event.findBehavior(TiledFeatureComponent) as TiledFeatureComponent;
    if (feature) {
      feature.enter(this);
      this.feature = feature;
    }
  }

  /** The player was touching a game feature, and is now leaving. */
  onFeatureLookAway(event: GameFeatureObject) {
    const feature = event.findBehavior(TiledFeatureComponent) as TiledFeatureComponent;
    if (feature) {
      feature.exit(this);
      this.feature = null;
    }
  }

  private _featureComponent$ = new BehaviorSubject<TiledFeatureComponent>(null);

  featureComponent$: Observable<TiledFeatureComponent> = this._featureComponent$;

  get feature(): TiledFeatureComponent {
    return this._featureComponent$.value;
  }

  set feature(value: TiledFeatureComponent) {
    this._featureComponent$.next(value);
  }

  escapeFeature() {
    if (this.feature) {
      this.onFeatureLookAway(this.feature.host);
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
    this.objectRenderer.render(this, this, view);

    // Any path target
    if (this.movable) {
      const target = this.movable;
      if (this.movable.path && this.movable.path.length > 0) {
        view.context.save();
        const destination: Point = target.path[target.path.length - 1].clone();
        destination.x -= 0.5;
        destination.y -= 0.5;

        const screenTile: Rect = view.worldToScreen(new Rect(destination, new Point(1, 1)));
        view.context.fillStyle = this.targetFill;
        view.context.fillRect(screenTile.point.x, screenTile.point.y, screenTile.extent.x, screenTile.extent.y);
        view.context.strokeStyle = this.targetStroke;
        view.context.lineWidth = this.targetStrokeWidth;
        view.context.strokeRect(screenTile.point.x, screenTile.point.y, screenTile.extent.x, screenTile.extent.y);

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
  PlayerTriggerBehaviorComponent
];
