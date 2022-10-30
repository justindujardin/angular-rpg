import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Point } from '../../../app/core/point';
import { IProcessObject } from '../../../app/core/time';
import { AppState } from '../../app.model';
import { LoadingService } from '../../components/loading/loading.service';
import { NotificationService } from '../../components/notification/notification.service';
import { NamedMouseElement, PowInput } from '../../core/input';
import { GameEntityObject } from '../../scene/objects/game-entity-object';
import { Scene } from '../../scene/scene';
import { SceneObject } from '../../scene/scene-object';
import { SceneView } from '../../scene/scene-view';
import { Animate } from '../../services/animate';
import { GameWorld } from '../../services/game-world';
import { RPGGame } from '../../services/rpg-game';
import { CombatMapComponent } from './combat-map.entity';
import { CombatPlayerComponent } from './combat-player.entity';
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
  combat: CombatComponent = this;

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
  @ViewChild(CombatMapComponent) map: CombatMapComponent;

  private _subscriptions: Subscription[] = [];

  constructor(
    public game: RPGGame,
    public notify: NotificationService,
    public animate: Animate,
    public loadingService: LoadingService,
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
    targetPos.y -= this.camera.point.y + 1.25;
    targetPos.x -= this.camera.point.x;
    const screenPos: Point = this.worldToScreen(targetPos, this.cameraScale);
    screenPos.add(
      this.canvasElementRef.nativeElement.offsetLeft,
      this.canvasElementRef.nativeElement.offsetTop
    );
    this.damages.push({
      timeout: new Date().getTime() + 5 * 1000,
      value: Math.abs(value),
      classes: {
        miss: value === 0,
        heal: value < 0,
      },
      position: screenPos,
    });
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
}
