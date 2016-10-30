import * as _ from 'underscore';
import {Component, ElementRef, Input, AfterViewInit, ViewChild, ViewChildren, QueryList} from '@angular/core';
import {IProcessObject} from '../../../game/pow-core/time';
import {TileObjectRenderer} from '../../../game/pow2/tile/render/tileObjectRenderer';
import {NamedMouseElement, PowInput} from '../../../game/pow2/core/input';
import {RPGGame} from '../../services/rpgGame';
import {GameWorld} from '../../services/gameWorld';
import {Notify} from '../../services/notify';
import {Point, IPoint} from '../../../game/pow-core/point';
import {Scene} from '../../../game/pow2/scene/scene';
import {CameraComponent} from '../../../game/pow2/scene/components/cameraComponent';
import {SpriteComponent} from '../../../game/pow2/tile/components/spriteComponent';
import {SceneComponent} from '../../../game/pow2/scene/sceneComponent';
import {GameEntityObject} from '../../../game/rpg/objects/gameEntityObject';
import {SceneObject} from '../../../game/pow2/scene/sceneObject';
import {IGameEncounter} from '../../../game/rpg/game';
import {ItemModel} from '../../../game/rpg/models/itemModel';
import {HeroModel} from '../../../game/rpg/models/heroModel';
import {TileMapView} from '../../../game/pow2/tile/tileMapView';
import {UIAttachment, ChooseActionStateMachine, ChooseActionType} from './behaviors/choose-action.machine';
import {IChooseActionEvent} from './states/combat-choose-action.state';
import {CombatRunSummary} from './states/combat-escape.state';
import {CombatVictorySummary} from './states/combat-victory.state';
import {CombatDefeatSummary} from './states/combat-defeat.state';
import {CombatCameraBehavior} from './behaviors/combat-camera.behavior';
import {CombatPlayerRenderBehavior} from './behaviors/combat-player-render.behavior';
import {CombatActionBehavior} from './behaviors/combat-action.behavior';
import {Actions} from '@ngrx/effects';
import {LoadingService} from '../../components/loading/loading.service';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {CombatService} from '../../services/combat.service';
import {Subscription} from 'rxjs/Rx';
import {CombatStateMachine, CombatAttackSummary} from './states/combat.machine';
import {GameTileMap} from '../../../game/gameTileMap';
import {getEncounterEnemies} from '../../models/combat/combat.reducer';
import {getParty} from '../../models/game-state/game-state.reducer';
import {CombatEnemy} from './combat-enemy.entity';
import {CombatPlayer} from './combat-player.entity';

/**
 * Describe a selectable menu item for a user input in combat.
 */
export interface ICombatMenuItem<T> {
  select(): any;
  label: string;
}

@Component({
  selector: 'combat-map',
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
export class CombatComponent extends TileMapView implements IProcessObject, AfterViewInit {

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
  items: ICombatMenuItem<any>[] = [];

  /** The combat state machine */
  readonly machine: CombatStateMachine = new CombatStateMachine();

  /**
   * Damages displaying on screen.
   * @type {Array}
   */
  @Input()
  damages: any[] = [];

  /**
   * For rendering `TileObject`s
   * @type {TileObjectRenderer}
   */
  objectRenderer: TileObjectRenderer = new TileObjectRenderer;


  /**
   * Mouse hook for capturing input with world and screen coordinates.
   */
  mouse: NamedMouseElement = null;

  @ViewChild('combatCanvas') canvasElementRef: ElementRef;
  @ViewChild('combatPointer') pointerElementRef: ElementRef;

  @ViewChildren(CombatEnemy) enemies: QueryList<CombatEnemy>;
  @ViewChildren(CombatPlayer) party: QueryList<CombatPlayer>;

  /** Observable<Combatant[]> of enemies */
  enemies$ = getEncounterEnemies(this.store);

  /** Observable<PartyMember[]> of party members */
  party$ = getParty(this.store);

  private _subscriptions: Subscription[] = [];

  constructor(public game: RPGGame,
              public actions$: Actions,
              public notify: Notify,
              public loadingService: LoadingService,
              public store: Store<AppState>,
              public combatService: CombatService,
              public world: GameWorld) {
    super();
    this.world.mark(this.scene);
  }


  ngOnDestroy(): void {
    this.world.erase(this.scene);
    this.world.time.removeObject(this);
    this._subscriptions.forEach((s) => s.unsubscribe());
    this._subscriptions.length = 0;
    this.scene.removeView(this);
    this.machine.off('combat:chooseMoves', this.chooseTurns, this);
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

    this.machine.on('combat:chooseMoves', this.chooseTurns, this);

    this.pointer = {
      element: this.pointerElementRef.nativeElement,
      object: null,
      offset: new Point()
    };

    // Because the base class looks for instance.map before rendering the tilemap.  TODO: Remove this.
    this._subscriptions.push(this.combatService.combatMap$
      .do((map: GameTileMap) => {
        this.map = map;
      })
      .subscribe());

    this._subscriptions.push(this.combatService.combatMap$
      .distinctUntilChanged()
      .do((map: GameTileMap) => {
        this.party.forEach((p: CombatPlayer, index: number) => {
          p.setSprite(p.model.icon);
          const battleSpawn = map.getFeature('p' + (index + 1)) as IPoint;
          p.setPoint(new Point(battleSpawn.x / 16, battleSpawn.y / 16));
        });
        this.enemies.forEach((e: CombatEnemy, index: number) => {
          const battleSpawn = map.getFeature('e' + (index + 1)) as IPoint;
          if (battleSpawn) {
            e.setPoint(new Point(battleSpawn.x / 16, battleSpawn.y / 16));
          }
        });
      })
      .subscribe());
  }


  //
  // Events
  //

  onAddToScene(scene: Scene) {
    super.onAddToScene(scene);
    if (scene.world && scene.world.input) {
      this.mouse = scene.world.input.mouseHook(this, "combat");
    }
  }

  onRemoveFromScene(scene: Scene) {
    if (scene.world && scene.world.input) {
      scene.world.input.mouseUnhook("combat");
    }
  }

  //
  // Time Processing
  //
  tick(elapsed: number) {
    if (!this || !this.pointer || !this.pointer.object) {
      return;
    }
    var targetPos: Point = this.pointer.object.point.clone();
    targetPos.y = (targetPos.y - this.camera.point.y) + this.pointer.offset.y;
    targetPos.x = (targetPos.x - this.camera.point.x) + this.pointer.offset.x;
    var screenPos: Point = this.worldToScreen(targetPos, this.cameraScale);
    var el: any = jQuery(this.pointer.element);
    el.css({
      left: screenPos.x,
      top: screenPos.y
    });
  }


  /**
   * Update the camera for this frame.
   */
  processCamera() {
    this.cameraComponent = <CameraComponent>this.scene.componentByType(CombatCameraBehavior);
    super.processCamera();
  }

  /**
   * Render the tile map, and any features it has.
   */
  renderFrame(elapsed: number) {
    super.renderFrame(elapsed);

    const players = this.scene.objectsByComponent(CombatPlayerRenderBehavior);
    _.each(players, (player) => {
      this.objectRenderer.render(player, player, this);
    });

    const sprites = <SceneComponent[]>this.scene.componentsByType(SpriteComponent);
    _.each(sprites, (sprite: any) => {
      this.objectRenderer.render(sprite.host, sprite, this);
    });
    return this;
  }


  //
  // API
  //
  chooseTurns(data: IChooseActionEvent) {
    if (!this.scene) {
      throw new Error("Invalid Combat Scene");
    }
    var chooseSubmit = (action: CombatActionBehavior) => {
      inputState.data.choose(action);
      next();
    };
    var inputState = new ChooseActionStateMachine(this, data, chooseSubmit);
    inputState.data = data;
    var choices: GameEntityObject[] = data.players.slice();
    var next = () => {
      var p: GameEntityObject = choices.shift();
      if (!p) {
        return;
      }
      inputState.current = p;
      inputState.setCurrentState(ChooseActionType.NAME);
    };
    next();
  }

  setPointerTarget(object: GameEntityObject, directionClass: string = "right", offset: Point = new Point()) {
    var el: JQuery = jQuery(this.pointer.element);
    el.removeClass('left right');
    el.addClass(directionClass);
    if (this.pointer) {
      this.pointer.object = object;
      this.pointer.offset = offset;
    }
  }

  addPointerClass(clazz: string) {
    jQuery(this.pointer.element).addClass(clazz);
  }

  removePointerClass(clazz: string) {
    jQuery(this.pointer.element).removeClass(clazz);
  }


  getMemberClass(member: GameEntityObject, focused?: GameEntityObject): any {
    return {
      focused: focused && focused.model && member.model.name === focused.model.name
    };
  }

  /**
   * Apply damage visual effect to a SceneObject with a given value
   * @param to The SceneObject to visually damage
   * @param value The damage value (negative is considered healing, 0 is miss)
   */
  applyDamage(to: SceneObject, value: number) {
    const targetPos: Point = to.point.clone();
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
    //console.log("clicked at " + this.mouse.world);
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
    this.machine.on('combat:start', (encounter: IGameEncounter) => {
      if (encounter && encounter.message) {
        var _done = this.machine.notifyWait();
        // If the message contains pipe's, treat what is between each pipe as a separate
        // message to be displayed.
        var msgs = [encounter.message];
        if (encounter.message.indexOf('|') !== -1) {
          msgs = encounter.message.split('|')
        }
        var last = msgs.pop();
        msgs.forEach((m) => this.notify.show(m, null, 0));
        this.notify.show(last, _done, 0);
      }
    });
    this.machine.on('combat:attack', (data: CombatAttackSummary) => {
      var _done = this.machine.notifyWait();
      var msg: string = '';
      var a = data.attacker.name;
      var b = data.defender.name;
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
      var _done = this.machine.notifyWait();
      var msg: string = data.player.model.get('name');
      if (data.success) {
        msg += ' bravely ran away!';
      }
      else {
        msg += ' failed to escape!';
      }
      this.notify.show(msg, _done);
    });
    this.machine.on('combat:victory', (data: CombatVictorySummary) => {
      var _done = this.machine.notifyWait();
      this.notify.show("Found " + data.gold + " gold!", null, 0);
      if (data.items) {
        _.each(data.items, (item: ItemModel) => {
          this.notify.show("Found " + item.get('name'), null, 0);
        });
      }
      this.notify.show("Gained " + data.exp + " experience!", null, 0);
      _.each(data.levels, (hero: HeroModel) => {
        this.notify.show(hero.get('name') + " reached level " + hero.get('level') + "!", null, 0);
      });
      this.notify.show("Enemies Defeated!", _done);
    });
    this.machine.on('combat:defeat', (data: CombatDefeatSummary) => {
      var done = this.machine.notifyWait();
      this.notify.show("Your party was defeated...", () => {
        this.game.initGame().then(done);
      }, 0);
    });

  }
}
