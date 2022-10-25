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
import { Store } from '@ngrx/store';
import * as Immutable from 'immutable';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AppState } from '../../../app.model';
import { SceneObjectBehavior } from '../../../behaviors/scene-object-behavior';
import { LoadingService } from '../../../components/loading/loading.service';
import {
  Behavior,
  IPoint,
  Point,
  ResourceManager,
  TiledTMXResource,
} from '../../../core';
import { Entity } from '../../../models/entity/entity.model';
import { GameStateService } from '../../../models/game-state/game-state.service';
import {
  getGameKeyData,
  getGameParty,
  getGamePartyPosition,
} from '../../../models/selectors';
import { TileObjectRenderer } from '../../../scene/render/tile-object-renderer';
import { Scene } from '../../../scene/scene';
import { SceneView } from '../../../scene/scene-view';
import { ISceneViewRenderer } from '../../../scene/scene.model';
import { TileMap } from '../../../scene/tile-map';
import { MapFeatureInputBehaviorComponent } from '../behaviors/map-feature-input.behavior';
import { MapFeatureComponent, TiledMapFeatureData } from './map-feature.component';
import { WorldPlayerComponent } from './world-player.entity';

@Component({
  selector: 'world-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'world-map.entity.html',
})
export class WorldMapComponent
  extends TileMap
  implements AfterViewInit, OnDestroy, ISceneViewRenderer
{
  /** For referencing in template */
  readonly self: WorldMapComponent = this;

  @Input() scene: Scene;

  renderPoint: Point = new Point();

  @ViewChild(WorldPlayerComponent) player: WorldPlayerComponent;
  @ViewChildren('input') behaviors: QueryList<Behavior>;
  @ViewChildren(MapFeatureComponent) mapFeatures: QueryList<MapFeatureComponent>;

  private _subscriptions: Subscription[] = [];

  /** The {@see TiledTMXResource} map at the input url */
  resource$: Observable<TiledTMXResource> = this.gameStateService.worldMap$.pipe(
    distinctUntilChanged(),
    map((result: TiledTMXResource) => {
      this.setMap(result);
      return result;
    })
  );

  /** Features can be derived after a new map resource has been loaded */
  features$: Observable<TiledMapFeatureData[]> = this.resource$.pipe(
    map(() => {
      return this.features.objects;
    })
  );

  /**
   * Exclude features that are marked as hidden in the game keydata storage.
   */
  activeFeatures$: Observable<any> = combineLatest(
    [this.store.select(getGameKeyData), this.features$],
    (keyMap: Immutable.Map<string, any>, features: TiledMapFeatureData[]) => {
      const out = features.filter((f: TiledMapFeatureData) => {
        const idKey = !!keyMap.get(f.properties?.id);
        const hasAfterKey = typeof f.properties?.after !== 'undefined';
        const hasUntilKey = typeof f.properties?.until !== 'undefined';
        const afterKey = keyMap.get(f.properties?.after);
        const untilKey = keyMap.get(f.properties?.until);
        // This is disabled because its id is found in key store
        if (idKey === true) {
          return false;
        }
        // The after key is present and satisfied
        if (hasAfterKey && !afterKey) {
          return false;
        }
        // The until key is present and satisfied
        if (hasUntilKey && untilKey) {
          return false;
        }
        // Nothing stops this, it's enabled
        return true;
      });
      return out;
    }
  );

  private _renderPoint$: BehaviorSubject<IPoint> = new BehaviorSubject(
    this.renderPoint
  );

  /** Observable of the current player position in the world */
  renderPoint$: Observable<Point> = combineLatest(
    [this.store.select(getGamePartyPosition), this._renderPoint$],
    (point: IPoint, renderPoint: IPoint) => {
      this.renderPoint.set(point || renderPoint);
      return this.renderPoint;
    }
  );

  constructor(
    public gameStateService: GameStateService,
    public store: Store<AppState>,
    public loadingService: LoadingService,
    public loader: ResourceManager
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.scene.addObject(this);
    this.behaviors.forEach((c: SceneObjectBehavior) => {
      this.addBehavior(c);
    });
    this.mapFeatures.changes.subscribe((value: QueryList<MapFeatureComponent>) =>
      value.forEach((c) => {
        // Add behaviors that aren't already known
        if (!this.findBehaviorByName(c.name)) {
          this.addBehavior(c);
        }
        // Update the host
        if (c.host) {
          c.host.tileMap = this;
        }
        // this.removeBehavior(c);
      })
    );
    // To update renderPoint when party point changes
    this._subscriptions.push(this.position$.subscribe());
  }

  ngOnDestroy(): void {
    this.scene.removeObject(this);
    this.behaviors.forEach((c: SceneObjectBehavior) => {
      this.removeBehavior(c);
    });
    this._subscriptions.forEach((s) => s.unsubscribe());
    this._subscriptions.length = 0;
    this.destroy();
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
    this.mapFeatures.forEach((mapFeatureComponent: MapFeatureComponent) => {
      if (mapFeatureComponent.host) {
        const data = mapFeatureComponent.host;
        this.objectRenderer.render(
          data,
          data.renderPoint || data.point,
          view,
          data.meta
        );
      }
    });
  }

  afterFrame(view: SceneView, elapsed: number) {
    // Nope
  }

  //
  // Party position
  //

  notTraveling$: Observable<boolean> = this.loadingService.loading$.pipe(
    map((loading: boolean) => !loading)
  );

  /** Observable of the current player position in the world. Keeps renderPoint in sync after each move. */
  position$: Observable<IPoint> = this.store.select(getGamePartyPosition).pipe(
    distinctUntilChanged(),
    map((position: IPoint) => {
      this.renderPoint = new Point(position);
      return this.renderPoint;
    })
  );

  /** Observable of Entity representing the player-card leader to be rendered in the world */
  partyLeader$: Observable<Entity> = this.store.select(getGameParty).pipe(
    map((party: Immutable.List<Entity>) => {
      return party.get(0);
    })
  );
}

/** Components associated with world map */
export const WORLD_MAP_COMPONENTS = [
  WorldMapComponent,
  MapFeatureComponent,
  MapFeatureInputBehaviorComponent,
];
