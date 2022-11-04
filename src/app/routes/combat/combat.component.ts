import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import _ from 'underscore';
import { IPoint, Point } from '../../../app/core/point';
import { IProcessObject } from '../../../app/core/time';
import { AppState } from '../../app.model';
import { SpriteComponent } from '../../behaviors/sprite.behavior';
import { LoadingService } from '../../components/loading/loading.service';
import { NotificationService } from '../../components/notification/notification.service';
import { Rect, ResourceManager, TiledTMXResource } from '../../core';
import { NamedMouseElement, PowInput } from '../../core/input';
import { ITiledObject } from '../../core/resources/tiled/tiled.model';
import { CombatantTypes, IEnemy, IPartyMember } from '../../models/base-entity';
import { CombatState } from '../../models/combat/combat.model';
import { CombatService } from '../../models/combat/combat.service';
import {
  getCombatEncounterEnemies,
  getCombatEncounterParty,
  sliceCombatState,
} from '../../models/selectors';
import { GameEntityObject } from '../../scene/objects/game-entity-object';
import { TileMapRenderer } from '../../scene/render/tile-map-renderer';
import {
  TileObjectRenderer,
  TileRenderable,
} from '../../scene/render/tile-object-renderer';
import { Scene } from '../../scene/scene';
import { SceneObject } from '../../scene/scene-object';
import { SceneView } from '../../scene/scene-view';
import { TileMap } from '../../scene/tile-map';
import { Animate } from '../../services/animate';
import { GameWorld } from '../../services/game-world';
import { RPGGame } from '../../services/rpg-game';
import { CombatEnemyComponent } from './combat-enemy.component';
import { CombatPlayerComponent } from './combat-player.component';
import {
  CombatAttackSummary,
  ICombatDamageSummary,
  ICombatMenuItem,
  UIAttachment,
} from './combat.types';
import { CombatDefeatSummary } from './states/combat-defeat.state';
import { CombatRunSummary } from './states/combat-escape.state';
import { CombatStateMachineComponent } from './states/combat.machine';

@Component({
  selector: 'rpg-combat',
  styleUrls: ['./combat.component.scss'],
  templateUrl: './combat.component.html',
  host: {
    '(window:resize)': '_onResize($event)',
    '(click)': '_onClick($event)',
  },
})
/**
 * Render and provide input for a combat encounter.
 */
export class CombatComponent
  extends SceneView
  implements IProcessObject, OnDestroy, AfterViewInit
{
  @Input() scene: Scene = new Scene();
  /**
   * A pointing UI element that can be attached to `SceneObject`s to attract attention
   * @type {null}
   */
  pointer: UIAttachment | null = null;

  /**
   * Available menu items for selection.
   */
  @Input()
  items: ICombatMenuItem[] = [];

  /** The combat state machine */
  @ViewChild(CombatStateMachineComponent) machine: CombatStateMachineComponent;

  /**
   * Damages displaying on screen.
   * @type {Array}
   */
  @Input() damages: ICombatDamageSummary[] = [];

  /**
   * Mouse hook for capturing input with world and screen coordinates.
   */
  mouse: NamedMouseElement | null = null;

  @ViewChild('combatCanvas') canvasElementRef: ElementRef;
  map: TileMap = new TileMap();

  private _tileRenderer: TileMapRenderer = new TileMapRenderer();

  enemies$: Observable<IEnemy[]> = this.store
    .select(getCombatEncounterEnemies)
    .pipe(map((f) => f.toJS()));

  party$: Observable<IPartyMember[]> = this.store
    .select(getCombatEncounterParty)
    .pipe(map((f) => f.toJS()));

  encounter$: Observable<CombatState> = this.store.select(sliceCombatState);

  @ViewChildren('partyMember') party: QueryList<CombatPlayerComponent>;
  @ViewChildren('enemy') enemies: QueryList<CombatEnemyComponent>;

  /** The {@see TiledTMXResource} map at the input url */
  resource$: Observable<TiledTMXResource> = this.combatService.combatMap$.pipe(
    distinctUntilChanged(),
    map((result: TiledTMXResource) => {
      this.map.setMap(result);
      return result;
    })
  );

  /** Features can be derived after a new map resource has been loaded */
  features$: Observable<ITiledObject[]> = this.resource$.pipe(
    map(() => {
      return this.map.features?.objects || [];
    })
  );

  /**
   * @internal used to make `resource$` observable hot. Can be removed if the template references an
   * async binding for this at any point.
   */
  private _resourceSubscription: Subscription | null;
  private _subscriptions: Subscription[] = [];

  constructor(
    public game: RPGGame,
    public notify: NotificationService,
    public animate: Animate,
    public loadingService: LoadingService,
    public loader: ResourceManager,
    public combatService: CombatService,
    public store: Store<AppState>,
    public world: GameWorld,
    private cd: ChangeDetectorRef
  ) {
    super();
    this.world.mark(this.scene);
  }

  ngOnDestroy(): void {
    // TODO: Got everything here?
    this.world.erase(this.scene);
    this.world.time.removeObject(this);
    this.scene.removeView(this);
    this.pointer = null;
    this.damages = [];
    this._subscriptions.forEach((s) => {
      s?.unsubscribe();
    });
    this._subscriptions = [];

    this._resourceSubscription?.unsubscribe();
    // this.scene?.removeObject(this);
    this.destroy();
  }

  ngAfterViewInit(): void {
    this.canvas = this.canvasElementRef.nativeElement;
    if (this.camera) {
      this.camera.point.zero();
      this.camera.extent.set(25, 25);
    }
    this.scene.addView(this);
    setTimeout(() => this._onResize(), 1);
    this.world.time.addObject(this);

    const attackSub = this.machine.onAttack$.subscribe((data: CombatAttackSummary) => {
      const _done = this.machine.notifyWait();
      let msg: string = '';
      const a = data.attacker.model?.name || '';
      const b = data.defender.model?.name || '';
      if (data.damage > 0) {
        msg = `${a} attacked ${b} for ${data.damage} damage!`;
      } else if (data.damage < 0) {
        msg = `${a} healed ${b} for ${Math.abs(data.damage)} hit points`;
      } else {
        msg = `${a} attacked ${b}, and MISSED!`;
      }
      this.applyDamage(data.defender, data.damage);
      // players taking damage shake the camera
      if (data.damage > 0 && data.defender instanceof CombatPlayerComponent) {
        this.shake(this.canvasElementRef.nativeElement);
      }
      this.notify.show(msg, _done);
    });
    const runSub = this.machine.onRun$.subscribe((data: CombatRunSummary) => {
      const _done = this.machine.notifyWait();
      let msg: string = data.player?.model?.name || '';
      if (data.success) {
        msg += ' bravely ran away!';
      } else {
        msg += ' failed to escape!';
      }
      this.notify.show(msg, _done);
    });
    const defeatSub = this.machine.onDefeat$.subscribe((data: CombatDefeatSummary) => {
      const done = this.machine.notifyWait();
      this.notify.show(
        'Your party was defeated...',
        () => {
          this.game.initGame().then(done);
        },
        0
      );
    });
    this.scene?.addObject(this);
    // Whenever the underlying map resource changes, update party/enemy state from latest values.
    this._resourceSubscription = this.resource$
      .pipe(
        map(() => {
          this.party.forEach((p: CombatPlayerComponent, index: number) => {
            p.setSprite(p.model.icon);
            const battleSpawn = this.map.getFeature('p' + (index + 1)) as IPoint;
            p.setPoint(new Point(battleSpawn.x / 16, battleSpawn.y / 16));
          });
          this.enemies.forEach((e: CombatEnemyComponent, index: number) => {
            const battleSpawn = this.map.getFeature('e' + (index + 1)) as IPoint;
            if (battleSpawn) {
              e.setPoint(new Point(battleSpawn.x / 16, battleSpawn.y / 16));
            }
          });
        })
      )
      .subscribe();

    this._subscriptions = [attackSub, runSub, defeatSub];

    this.cd.detectChanges();
  }

  //
  // Events
  //

  onAddToScene(scene: Scene) {
    super.onAddToScene(scene);
    if (scene.world && scene.world.input) {
      this.mouse = scene.world.input.mouseHook(this, 'combat');
    }
  }

  onRemoveFromScene(scene: Scene) {
    if (scene.world && scene.world.input) {
      scene.world.input.mouseUnhook('combat');
    }
  }

  //
  // Time Processing
  //
  tick(elapsed: number) {
    if (!this || !this.pointer || !this.pointer.object) {
      return;
    }
    const targetPos: Point = new Point(this.pointer.object.point);
    targetPos.y = targetPos.y - this.camera.point.y + this.pointer.offset.y;
    targetPos.x = targetPos.x - this.camera.point.x + this.pointer.offset.x;
    const screenPos: Point = this.worldToScreen(targetPos, this.cameraScale);
    const el: HTMLElement = this.pointer.element.nativeElement;
    el.style.left = `${screenPos.x}px`;
    el.style.top = `${screenPos.y}px`;
  }

  //
  // ISceneViewRenderer
  //
  objectRenderer: TileObjectRenderer = new TileObjectRenderer();

  /**
   * Update the camera for this frame.
   */
  processCamera() {
    if (this.context) {
      const w: number = this.context.canvas.width;
      const screenRect = new Rect(
        0,
        0,
        this.context.canvas.width,
        this.context.canvas.height
      );
      this.cameraScale = w > 1024 ? 6 : w > 768 ? 4 : w > 480 ? 3 : 2;
      this.camera = this.screenToWorld(screenRect, this.cameraScale);
      this.camera.point.x = this.map.bounds.extent.x / 2 - this.camera.extent.x / 2;
    }

    super.processCamera();
  }
  beforeFrame(view: SceneView, elapsed: number) {
    // Nope
  }

  /**
   * Render all of the map feature components
   */
  renderFrame(elapsed: number) {
    this.clearRect();
    this._tileRenderer.render(this.map, this);
    this.party.forEach((component: CombatPlayerComponent) => {
      this.objectRenderer.render(
        component as TileRenderable,
        component.renderPoint || component.point,
        this
      );
      const sprites = component.findBehaviors(SpriteComponent) as SpriteComponent[];
      sprites.forEach((sprite: SpriteComponent) => {
        this.objectRenderer.render(sprite as TileRenderable, sprite.host.point, this);
      });
    });
    this.enemies.forEach((component: CombatEnemyComponent) => {
      this.objectRenderer.render(
        component as TileRenderable,
        component.renderPoint || component.point,
        this
      );
      const sprites: SpriteComponent[] = component.findBehaviors(SpriteComponent);
      sprites.forEach((sprite: SpriteComponent) => {
        this.objectRenderer.render(sprite as TileRenderable, sprite.host.point, this);
      });
    });
    return this;
  }

  afterFrame(view: SceneView, elapsed: number) {
    // Nope
  }

  //
  // API
  //

  /**
   * Apply damage visual effect to a SceneObject with a given value
   * @param to The SceneObject to visually damage
   * @param value The damage value (negative is considered healing, 0 is miss)
   */
  applyDamage(to: SceneObject, value: number) {
    const targetPos: Point = new Point(to.point);
    targetPos.y -= this.camera.point.y + 1.25;
    targetPos.x -= this.camera.point.x;
    const screenPos: Point = this.worldToScreen(targetPos, this.cameraScale);
    screenPos.add(
      this.canvasElementRef.nativeElement.offsetLeft,
      this.canvasElementRef.nativeElement.offsetTop
    );
    this.damages.push({
      id: _.uniqueId('dmg'),
      timeout: new Date().getTime() + 5 * 1000,
      value: Math.abs(value),
      classes: {
        miss: value === 0,
        heal: value < 0,
      },
      position: screenPos,
    });
  }

  removeDamage(damage: ICombatDamageSummary) {
    this.damages = this.damages.filter((d) => d.id !== damage.id);
  }

  /**
   * Shake a given HTMLElement for some duration
   * @param el The element to shake
   * @param duration The duration to keep the shake effect going.
   */
  shake(el: HTMLElement, duration: number = 0.3): Promise<void> {
    return new Promise((resolve) => {
      const inPromise = this.animate.enter(el, 'shake');
      setTimeout(() => {
        const outPromise = this.animate.leave(el, 'shake');
        Promise.all([inPromise, outPromise]).then(() => {
          el.classList.remove('shake');
          resolve();
        });
      }, duration * 1000);
    });
  }

  /**
   * Mouse input
   */
  _onClick(e: any) {
    // console.log("clicked at " + this.mouse.world);
    const hits: GameEntityObject[] = [];
    if (this.mouse) {
      PowInput.mouseOnView(e, this, this.mouse);
      if (this.scene.db.queryPoint(this.mouse.world, GameEntityObject, hits)) {
        this.machine.onClick$.emit({ mouse: this.mouse, hits: hits });
        e.stopImmediatePropagation();
        return false;
      }
    }
  }

  /**
   * Custom track by function for damage elements
   */
  damageTrackBy(index: number, item: ICombatDamageSummary): any {
    return item.id;
  }

  /**
   * Custom track by function for combatants. We need to keep them around by their
   * entity instance id so that the components are not created/destroyed as their
   * underlying model changes. This is important because these components instances
   * are passed through the combat state machine and their references must remain valid.
   */
  combatTrackBy(index: number, item: CombatantTypes): any {
    return item.eid;
  }
}
