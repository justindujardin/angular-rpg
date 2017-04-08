import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  AfterViewInit,
  ElementRef,
  OnDestroy,
  ViewChild,
  HostListener
} from '@angular/core';
import {NotificationService} from '../../components/notification/notification.service';
import {RPGGame} from '../../services/rpgGame';
import {GameWorld} from '../../services/gameWorld';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {Observable, Subscription, BehaviorSubject} from 'rxjs/Rx';
import {IPoint, Point} from '../../../game/pow-core';
import * as Immutable from 'immutable';
import {GameResources} from '../../services/game-resources.service';
import {MapFeatureComponent} from './map/map-feature.component';
import {PlayerBehaviorComponent} from './behaviors/player-behavior';
import {Scene} from '../../../game/pow2/scene/scene';
import {SceneView} from '../../../game/pow2/scene/sceneView';
import {TileMap} from '../../../game/pow2/tile/tileMap';
import {PathComponent} from '../../../game/pow2/tile/components/pathComponent';
import {PowInput, NamedMouseElement} from '../../../game/pow2/core/input';
import {GameEntityObject} from '../../../game/rpg/objects/gameEntityObject';
import {GameStateAddGoldAction} from '../../models/game-state/game-state.actions';
import {TileMapView} from '../../../game/pow2/tile/tileMapView';
import {GameStateService} from '../../models/game-state/game-state.service';
import {LoadingService} from '../../components/loading/loading.service';
import {getGameParty, getGamePartyPosition} from '../../models/selectors';
import {Entity} from '../../models/entity/entity.model';
import {TreasureFeatureComponent} from './map/features/treasure-feature.component';
import {Item} from '../../models/item';
import {EntityAddItemAction} from '../../models/entity/entity.actions';
import {PartyMenuComponent} from '../../components/party-menu/party-menu.component';
import {WorldMapComponent} from './map/world-map.entity';
import {WorldPlayerComponent} from './map/world-player.entity';

@Component({
  selector: 'world',
  styleUrls: ['./world.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './world.component.html',
  host: {
    '(window:resize)': '_onResize($event)',
    '(click)': '_onClick($event)',
    '[style.color]': 'styleBackground'
  }
})
export class WorldComponent extends TileMapView implements AfterViewInit, OnDestroy {
  /** Types of map features to listen for interaction with */
  private _featureTypes: string[] = [
    'TempleFeatureComponent',
    'DialogFeatureComponent',
    'PortalFeatureComponent',
    'StoreFeatureComponent',
    'ShipFeatureComponent'
  ];

  private _featureComponent$ = new BehaviorSubject<MapFeatureComponent>(null);

  featureComponent$: Observable<MapFeatureComponent> = this._featureComponent$;

  private _playerEntity$ = new BehaviorSubject<GameEntityObject>(null);

  playerEntity$: Observable<GameEntityObject> = this._playerEntity$;

  @ViewChild('worldCanvas') canvasElementRef: ElementRef;
  @ViewChild(PartyMenuComponent) partyMenu: PartyMenuComponent;

  /**
   * Escape action handler. Escape out of any active feature or menu
   */
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      // Escape out of any feature the player is currently in
      if (this._featureComponent$.value) {
        this._featureComponent$.next(null);
      }
      else if (this.partyMenu) {
        // Otherwise toggle the party menu
        this.partyMenu.toggle();
      }
    }
  }

  notTraveling$: Observable<boolean> = this.loadingService.loading$.map((loading: boolean) => !loading);

  /**
   * The feature type (if any) that is active.
   * relevant piece of UI to interact with the feature.
   */
  featureType$: Observable<string> = this.featureComponent$
  // return host type name
    .map((f: MapFeatureComponent) => {
      if (f && f.host) {
        return f.host.type;
      }
      return '';
    });

  /** Observable of the current player position in the world */
  position$: Observable<IPoint> = this.store
    .select(getGamePartyPosition)
    .distinctUntilChanged()
    .do((position: IPoint) => {
      this.renderPoint = new Point(position);
    });

  /** Observable of Entity representing the player-card leader to be rendered in the world */
  partyLeader$: Observable<Entity> = this.store.select(getGameParty)
    .map((party: Entity[]) => {
      return Immutable.Map(party[0]).toJS();
    });

  @ViewChild(WorldMapComponent) map: WorldMapComponent;
  @ViewChild(WorldPlayerComponent) player: WorldPlayerComponent;

  styleBackground: string = 'rgba(0,0,0,1)';
  mouse: NamedMouseElement = null;
  scene: Scene = new Scene();

  private _subscriptions: Subscription[] = [];

  constructor(public game: RPGGame,
              public notify: NotificationService,
              public loadingService: LoadingService,
              public store: Store<AppState>,
              public gameStateService: GameStateService,
              public world: GameWorld) {
    super();
    this.world.mark(this.scene);

    // To update renderPoint when party point changes
    this._subscriptions.push(this.position$.subscribe());
    // Whenever the player is created, or the position changes
    this._subscriptions.push(this.position$.combineLatest(this.playerEntity$)
      .distinctUntilChanged()
      .do((tuple: any) => {
        const position: IPoint = tuple[0];
        const player: GameEntityObject = tuple[1];
        if (player && !Point.equal(player.point, position)) {
          player.setPoint(position);
        }
      }).subscribe());

    // When the state position doesn't match where the user is
    // this._subscriptions.push(this.gameStateService.worldMap$.combineLatest(this.partyLeader$)
    //   .distinctUntilChanged()
    //   .do((tuple: any) => {
    //     const map: GameTileMap = tuple[0];
    //     const player: Entity = tuple[1];
    //     // this.renderModel(map, player);
    //   }).subscribe());
  }

  ngOnDestroy(): void {
    this.world.erase(this.scene);
    this._subscriptions.forEach((s) => s.unsubscribe());
    this._subscriptions.length = 0;
    this.scene.removeView(this);
  }

  ngAfterViewInit(): void {
    this.canvas = this.canvasElementRef.nativeElement;
    this.camera.point.set(-0.5, -0.5);
    this.scene.addView(this);
    setTimeout(() => this._onResize(), 1);
  }

  public _onResize(event?: Event) {
    super._onResize(event);
    // Camera (window bounds)
    if (this.map) {
      const tileOffset = this.map.bounds.getCenter();
      const offset = this._bounds.clone().divide(2).multiply(-1).add(tileOffset);
      this.camera.point.set(offset.floor());
    }
    this.camera.extent.set(this._bounds);
  }

  //
  // ISceneView implementation
  //
  onAddToScene(scene: Scene) {
    super.onAddToScene(scene);
    this.mouse = this.world.input.mouseHook(<SceneView> this, 'world');

    //
    // TODO: Consider how to remove these event listeners and replace with strongly typed observables
    //
    scene.on(TileMap.Events.MAP_LOADED, this.syncBehaviors, this);

    // When a portal is entered, update the map view to reflect the change.
    // scene.on('PortalFeatureComponent:entered', (data: any) => {
    //   this.store.dispatch(new GameStateTravelAction(data.map, data.target));
    // }, this);

    scene.on('TreasureFeatureComponent:entered', (feature: TreasureFeatureComponent) => {
      if (typeof feature.gold !== 'undefined') {
        this.store.dispatch(new GameStateAddGoldAction(feature.gold));
        this.notify.show(`You found ${feature.gold} gold!`, null, 0);
      }
      if (typeof feature.item === 'string') {
        const item = this.game.world.itemModelFromId<Item>(feature.item);
        if (!item) {
          return;
        }
        this.store.dispatch(new EntityAddItemAction(item));
        this.notify.show(`You found ${item.name}!`, null, 0);
      }
    }, this);

    this._featureTypes.forEach((eventName: string) => {
      scene.on(eventName + ':entered', (c: MapFeatureComponent) => {
        this._featureComponent$.next(c);
      }, this);
      scene.on(eventName + ':exited', (c: MapFeatureComponent) => {
        this._featureComponent$.next(null);
      }, this);
    });
  }

  onRemoveFromScene(scene: Scene) {
    this.world.input.mouseUnhook('world');
    scene.off(TileMap.Events.MAP_LOADED, this.syncBehaviors, this);
    scene.off('PortalFeatureComponent:entered', null, this);
    scene.off('TreasureFeatureComponent:entered', null, this);

    this._featureTypes.forEach((eventName: string) => {
      scene.off(eventName + ':entered', null, this);
      scene.off(eventName + ':exited', null, this);
    });
  }

  public _onClick(e: MouseEvent) {

    // Ignore clicks that did not originate on the canvas
    if (e.srcElement !== this.canvas) {
      return;
    }

    const pathComponent = this.scene.componentByType(PathComponent) as PathComponent;
    const playerComponent = this.scene.componentByType(PlayerBehaviorComponent) as PlayerBehaviorComponent;
    if (pathComponent && playerComponent) {
      PowInput.mouseOnView(e, this.mouse.view, this.mouse);
      playerComponent.path = pathComponent.calculatePath(playerComponent.targetPoint, this.mouse.world);
      e.preventDefault();
      return false;
    }
  }

  /**
   * Render the tile map and any features it has.
   */
  renderFrame(elapsed: number) {
    super.renderFrame(elapsed);
    // Map renders features
    if (this.map) {
      this.map.renderFrame(this, elapsed);
    }
    // Player renders self and target paths
    if (this.player) {
      this.player.renderFrame(this, elapsed);
    }
    return this;
  }
}
