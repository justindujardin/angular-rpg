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
import {RPGGame} from '../../services/rpg-game';
import {GameWorld} from '../../services/game-world';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {GameResources} from '../../services/game-resources.service';
import {PlayerBehaviorComponent} from './behaviors/player-behavior';
import {Scene} from '../../../game/pow2/scene/scene';
import {SceneView} from '../../../game/pow2/scene/scene-view';
import {TileMap} from '../../../game/pow2/tile/tile-map';
import {TileMapPathBehavior} from '../../../game/pow2/tile/behaviors/tile-map-path.behavior';
import {PowInput, NamedMouseElement} from '../../../game/pow2/core/input';
import {TileMapView} from '../../../game/pow2/tile/tile-map-view';
import {LoadingService} from '../../components/loading/loading.service';
import {PartyMenuComponent} from '../../components/party-menu/party-menu.component';
import {WorldMapComponent} from './map/world-map.entity';
import {GameFeatureObject} from '../../scene/game-feature-object';
import {Rect} from '../../../game/pow-core/rect';
import {Point} from '../../../game/pow-core/point';

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
  @ViewChild('worldCanvas') canvasElementRef: ElementRef;
  @ViewChild(PartyMenuComponent) partyMenu: PartyMenuComponent;

  /**
   * Whether to render debug view information
   */
  debug: boolean = false;

  /**
   * Escape action handler. Escape out of any active feature or menu
   */
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      // Escape out of any feature the player is currently in
      if (this.map.player && this.map.player.feature) {
        this.map.player.escapeFeature();
      }
      else if (this.partyMenu) {
        // Otherwise toggle the party menu
        this.partyMenu.open = !this.partyMenu.open;
      }
    }
    else if (event.key === '1') {
      this.debug = !this.debug;
    }
  }

  @ViewChild(WorldMapComponent) map: WorldMapComponent;

  styleBackground: string = 'rgba(0,0,0,1)';
  mouse: NamedMouseElement = null;
  scene: Scene = new Scene();

  constructor(public game: RPGGame,
              public notify: NotificationService,
              public loadingService: LoadingService,
              public store: Store<AppState>,
              public world: GameWorld) {
    super();
    this.world.mark(this.scene);
    this.world.time.start();
  }

  ngOnDestroy(): void {
    this.world.erase(this.scene);
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
  }

  onRemoveFromScene(scene: Scene) {
    this.world.input.mouseUnhook('world');
    scene.off(TileMap.Events.MAP_LOADED, this.syncBehaviors, this);
  }

  public _onClick(e: MouseEvent) {

    // Ignore clicks that did not originate on the canvas
    if (e.srcElement !== this.canvas) {
      return;
    }

    // TODO: Skip this scene lookup and use the player component and its path behavior.
    const pathComponent = this.scene.componentByType(TileMapPathBehavior) as TileMapPathBehavior;
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
      // Player renders self and target paths
      if (this.map.player) {
        this.map.player.renderFrame(this, elapsed);
      }
    }
    if (this.debug) {
      this.debugRender();
    }
    return this;
  }

  /**
   * Render Tile debug information.
   */
  debugRender() {
    const debugStrings = [
      `Camera: (${this.camera.point.x},${this.camera.point.y})`
    ];
    const player = this.scene.objectByComponent(PlayerBehaviorComponent);
    if (player) {
      debugStrings.push(`Player: (${player.point.x},${player.point.y})`);
    }
    const clipRect = this.getCameraClip();
    debugStrings.push(`Clip: (${clipRect.point.x},${clipRect.point.y}) (${clipRect.extent.x},${clipRect.extent.y})`);

    // Render the clip rectangle
    this.context.strokeStyle = '#00ff00';
    const screenClip = this.worldToScreen(clipRect);
    this.context.strokeRect(screenClip.point.x, screenClip.point.y, screenClip.extent.x, screenClip.extent.y);

    // Render impassable tiles on the map in the clip rect
    this.context.strokeStyle = '#ff0000';
    const clipXMin = clipRect.point.x;
    const clipXMax = clipRect.getRight();
    const clipYMin = clipRect.point.y;
    const clipYMax = clipRect.getBottom();
    for (let x = clipXMin; x <= clipXMax; x++) {
      for (let y = clipYMin; y <= clipYMax; y++) {
        this.map.getLayers().forEach((layer) => {
          const tile = this.map.getTerrain(layer.name, x, y);
          if (tile && !tile.passable) {
            const screenTile: Rect = this.worldToScreen(new Rect(new Point(x - 0.5, y - 0.5), new Point(1, 1)));
            this.context.strokeRect(screenTile.point.x, screenTile.point.y, screenTile.extent.x, screenTile.extent.y);
          }
        });
      }
    }

    // Game features
    this.context.strokeStyle = '#0000FF';
    const tiles = this.scene.objectsByType(GameFeatureObject);
    tiles.forEach((object: any) => {
      const point = object.renderPoint || object.point;
      const screenTile: Rect = this.worldToScreen(new Rect(new Point(point.x - 0.5, point.y - 0.5), new Point(1, 1)));
      this.context.strokeRect(screenTile.point.x, screenTile.point.y, screenTile.extent.x, screenTile.extent.y);
    });

    // Framerate information
    debugStrings.push(`MSPF: ${this.world.time.mspf}`);
    debugStrings.push(`FPS:  ${this.scene.fps.toFixed(0)}`);

    // Debug strings
    const fontSize = 6;
    this.context.save();
    this.context.font = `bold ${fontSize}px GraphicPixel`;
    const renderPos = this.worldToScreen(clipRect.point);
    let textX = renderPos.x + 10;
    let textY = renderPos.y + 10;
    let i: number;
    for (i = 0; i < debugStrings.length; ++i) {
      this.context.fillStyle = 'rgba(0,0,0,0.8)';
      this.context.fillText(debugStrings[i], textX + 1, textY + 1);
      this.context.fillStyle = 'rgba(255,255,255,1)';
      this.context.fillText(debugStrings[i], textX, textY);
      textY += fontSize;
    }
    this.context.restore();
  }
}
