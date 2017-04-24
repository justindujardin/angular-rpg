import {AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';
import {IProcessObject} from '../../../game/pow-core/time';
import {NamedMouseElement, PowInput} from '../../../game/pow2/core/input';
import {RPGGame} from '../../services/rpg-game';
import {GameWorld} from '../../services/game-world';
import {NotificationService} from '../../components/notification/notification.service';
import {Point} from '../../../game/pow-core/point';
import {Scene} from '../../../game/pow2/scene/scene';
import {GameEntityObject} from '../../scene/game-entity-object';
import {SceneObject} from '../../../game/pow2/scene/scene-object';
import {ItemModel} from '../../../game/rpg/models/itemModel';
import {HeroModel} from '../../../game/rpg/models/heroModel';
import {TileMapView} from '../../../game/pow2/tile/tile-map-view';
import {UIAttachment} from './behaviors/choose-action.machine';
import {CombatRunSummary} from './states/combat-escape.state';
import {CombatDefeatSummary} from './states/combat-defeat.state';
import {LoadingService} from '../../components/loading/loading.service';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {CombatStateMachineComponent} from './states/combat.machine';
import {CombatMapComponent} from './combat-map.entity';

/**
 * Describe a selectable menu item for a user input in combat.
 */
export interface ICombatMenuItem {
  select(): any;
  label: string;
}

/** Description of a combat entity attack */
export interface CombatAttackSummary {
  damage: number;
  attacker: GameEntityObject;
  defender: GameEntityObject;
}

@Component({
  selector: 'rpg-combat',
  styleUrls: ['./combat.component.scss'],
  templateUrl: './combat.component.html',
  host: {
    '(window:resize)': '_onResize($event)',
    '(click)': '_onClick($event)'
  }
})
/**
 * Render and provide input for a combat encounter.
 */
export class CombatComponent extends TileMapView implements IProcessObject, OnDestroy, AfterViewInit {

  combat: CombatComponent = this;

  @Input() scene: Scene = new Scene();
  /**
   * A pointing UI element that can be attached to `SceneObject`s to attract attention
   * @type {null}
   */
  pointer: UIAttachment = null;

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
  @Input() damages: any[] = [];

  /**
   * Mouse hook for capturing input with world and screen coordinates.
   */
  mouse: NamedMouseElement = null;

  @ViewChild('combatCanvas') canvasElementRef: ElementRef;
  @ViewChild(CombatMapComponent) map: CombatMapComponent;

  constructor(public game: RPGGame,
              public notify: NotificationService,
              public loadingService: LoadingService,
              public store: Store<AppState>,
              public world: GameWorld) {
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
  }

  ngAfterViewInit(): void {
    this.canvas = this.canvasElementRef.nativeElement;
    if (this.camera) {
      this.camera.point.zero();
      this.camera.extent.set(25, 25);
    }
    this.scene.addView(this);
    setTimeout(() => this._onResize(), 1);
    // this._bindRenderCombat();
    this.world.time.addObject(this);
    this._bindRenderCombat();
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
    targetPos.y = (targetPos.y - this.camera.point.y) + this.pointer.offset.y;
    targetPos.x = (targetPos.x - this.camera.point.x) + this.pointer.offset.x;
    const screenPos: Point = this.worldToScreen(targetPos, this.cameraScale);
    const el: HTMLElement = this.pointer.element.nativeElement;
    el.style.left = `${screenPos.x}px`;
    el.style.top = `${screenPos.y}px`;
  }

  /**
   * Update the camera for this frame.
   */
  processCamera() {
    this.cameraComponent = this.map.camera;
    super.processCamera();
  }

  /**
   * Render the tile map, and any features it has.
   */
  renderFrame(elapsed: number) {
    this.clearRect();
    this.map.renderFrame(this, elapsed);
    return this;
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
    targetPos.y -= (this.camera.point.y + 1.25);
    targetPos.x -= this.camera.point.x;
    const screenPos: Point = this.worldToScreen(targetPos, this.cameraScale);
    screenPos.add(this.canvasElementRef.nativeElement.offsetLeft, this.canvasElementRef.nativeElement.offsetTop);
    this.damages.push({
      timeout: new Date().getTime() + 5 * 1000,
      value: Math.abs(value),
      classes: {
        miss: value === 0,
        heal: value < 0
      },
      position: screenPos
    });
  }

  /**
   * Mouse input
   */
  _onClick(e: any) {
    // console.log("clicked at " + this.mouse.world);
    const hits: GameEntityObject[] = [];
    PowInput.mouseOnView(e, this, this.mouse);
    if (this.scene.db.queryPoint(this.mouse.world, GameEntityObject, hits)) {
      this.scene.trigger('click', this.mouse, hits);
      e.stopImmediatePropagation();
      return false;
    }
  }

  /**
   * Bind to combat events and reflect them in the UI.
   * @private
   */
  private _bindRenderCombat() {
    this.machine.on('combat:attack', (data: CombatAttackSummary) => {
      const _done = this.machine.notifyWait();
      let msg: string = '';
      const a = data.attacker.model.name;
      const b = data.defender.model.name;
      if (data.damage > 0) {
        msg = `${a} attacked ${b} for ${data.damage} damage!`;
      }
      else if (data.damage < 0) {
        msg = `${a} healed ${b} for ${Math.abs(data.damage)} hit points`;
      }
      else {
        msg = `${a} attacked ${b}, and MISSED!`;
      }
      this.applyDamage(data.defender, data.damage);
      this.notify.show(msg, _done);
    });
    this.machine.on('combat:run', (data: CombatRunSummary) => {
      const _done = this.machine.notifyWait();
      let msg: string = data.player.model.name;
      if (data.success) {
        msg += ' bravely ran away!';
      }
      else {
        msg += ' failed to escape!';
      }
      this.notify.show(msg, _done);
    });
    this.machine.on('combat:defeat', (data: CombatDefeatSummary) => {
      const done = this.machine.notifyWait();
      this.notify.show('Your entity was defeated...', () => {
        this.game.initGame().then(done);
      }, 0);
    });

  }
}
