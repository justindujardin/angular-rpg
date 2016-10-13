/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
import {Component, ElementRef, Input, AfterViewInit} from '@angular/core';
import {GameTileMap} from '../../gameTileMap';
import {CombatCameraComponent} from '../../rpg/components/combat/combatCameraComponent';
import {HeroModel, ItemModel} from '../../rpg/models/all';
import {GameEntityObject} from '../../rpg/objects/gameEntityObject';
import {CombatActionComponent} from '../../rpg/components/combat/actions/all';
import {ChooseActionStateMachine, ChooseActionType, UIAttachment} from './chooseActionStates';
import {PlayerCombatState, CombatAttackSummary} from '../../rpg/states/playerCombatState';
import {CombatDefeatSummary, CombatVictorySummary, CombatRunSummary} from '../../rpg/states/combat/all';
import {IChooseActionEvent} from '../../rpg/states/combat/combatChooseActionState';
import {RPGGame, Animate, Notify} from '../services/index';
import {Map} from '../map';
import * as rpg from '../../rpg/game';
import {TileObjectRenderer} from '../../pow2/tile/render/tileObjectRenderer';
import {NamedMouseElement, PowInput} from '../../pow2/core/input';
import {IProcessObject} from '../../pow-core/time';
import {Scene} from '../../pow2/scene/scene';
import {SceneComponent} from '../../pow2/scene/sceneComponent';
import {CameraComponent} from '../../pow2/scene/components/cameraComponent';
import {PlayerCombatRenderComponent} from '../../pow2/game/components/playerCombatRenderComponent';
import {SpriteComponent} from '../../pow2/tile/components/spriteComponent';
import {SceneObject} from '../../pow2/scene/sceneObject';
import {Point} from '../../pow-core/point';

const template = require('./combatMap.html') as string;

/**
 * Describe a selectable menu item for a user input in combat.
 */
export interface ICombatMenuItem<T> {
  select(): any;
  label: string;
}

@Component({
  selector: 'combat-map',
  styleUrls: ['./combatMap.scss'],
  host: {
    '(window:resize)': '_onResize($event)'
  },
  template: template
})
/**
 * Render and provide input for a combat encounter.
 */
export class CombatMap extends Map implements IProcessObject, AfterViewInit {
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

  /**
   * The combat state.
   */
  @Input()
  combat: PlayerCombatState = null;

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

  private _map: GameTileMap = null;
  /**
   * The `GameTileMap` to render.
   * @param value
   */
  @Input()
  set map(value: GameTileMap) {
    this._map = value;
    if (this._map) {
      this.setTileMap(value);
    }
  }

  get map(): GameTileMap {
    return this._map;
  }


  constructor(public elRef: ElementRef, public game: RPGGame, public animate: Animate, public notify: Notify) {
    super(elRef, game);
    this.mouseClick = _.bind(this.mouseClick, this);
  }

  ngAfterViewInit() {
    this.init(this.elRef.nativeElement.querySelector('canvas'));
    _.defer(()=>this._onResize());
    if (this.camera) {
      this.camera.point.zero();
      this.camera.extent.set(25, 25);
    }
    this._bindRenderCombat();

    this.combat.scene.addView(this);
    this.game.world.time.addObject(this);

    this.combat.machine.on('combat:chooseMoves', this.chooseTurns, this);

    this.pointer = {
      element: this.elRef.nativeElement.querySelector('.point-to-player'),
      object: null,
      offset: new Point()
    };
  }

  //
  // Events
  //
  onDestroy() {
    if (this.combat && this.combat.scene) {
      this.combat.scene.removeView(this);
      if (this.combat.machine) {
        this.combat.machine.off('combat:chooseMoves', this.chooseTurns, this);
      }
    }
    this.game.world.time.removeObject(this);
    this.pointer = null;
    this.damages = [];
  }

  onAddToScene(scene: Scene) {
    super.onAddToScene(scene);
    if (scene.world && scene.world.input) {
      this.mouse = scene.world.input.mouseHook(this, "combat");
    }
    this.$el.on('click touchstart', this.mouseClick);
  }

  onRemoveFromScene(scene: Scene) {
    if (scene.world && scene.world.input) {
      scene.world.input.mouseUnhook("combat");
    }
    this.$el.off('click touchstart', this.mouseClick);
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
    this.cameraComponent = <CameraComponent>this.scene.componentByType(CombatCameraComponent);
    super.processCamera();
  }

  /**
   * Render the tile map, and any features it has.
   */
  renderFrame(elapsed: number) {
    super.renderFrame(elapsed);

    var players = this.scene.objectsByComponent(PlayerCombatRenderComponent);
    _.each(players, (player) => {
      this.objectRenderer.render(player, player, this);
    });

    var sprites = <SceneComponent[]>this.scene.componentsByType(SpriteComponent);
    _.each(sprites, (sprite: any) => {
      this.objectRenderer.render(sprite.host, sprite, this);
    });
    return this;
  }


  //
  // API
  //
  chooseTurns(data: IChooseActionEvent) {
    if (!this.combat.scene) {
      throw new Error("Invalid Combat Scene");
    }
    var chooseSubmit = (action: CombatActionComponent)=> {
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
      focused: focused && focused.model && member.model.get('name') === focused.model.get('name')
    };
  }

  /**
   * Apply damage visual effect to a SceneObject with a given value
   * @param to The SceneObject to visually damage
   * @param value The damage value (negative is considered healing, 0 is miss)
   */
  applyDamage(to: SceneObject, value: number) {
    var targetPos: Point = to.point.clone();
    targetPos.y -= (this.camera.point.y + 1.25);
    targetPos.x -= this.camera.point.x;
    var screenPos: Point = this.worldToScreen(targetPos, this.cameraScale);
    screenPos.add(this.elRef.nativeElement.offsetLeft, this.elRef.nativeElement.offsetTop);
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
  mouseClick(e: any) {
    //console.log("clicked at " + this.mouse.world);
    var hits: GameEntityObject[] = [];
    PowInput.mouseOnView(e.originalEvent, this, this.mouse);
    if (this.combat.scene.db.queryPoint(this.mouse.world, GameEntityObject, hits)) {
      this.combat.scene.trigger('click', this.mouse, hits);
      e.stopImmediatePropagation();
      return false;
    }
  }


  /**
   * Bind to combat events and reflect them in the UI.
   * @private
   */
  private _bindRenderCombat() {
    this.combat.machine.on('combat:start', (encounter: rpg.IGameEncounter) => {
      if (encounter && encounter.message) {
        var _done = this.combat.machine.notifyWait();
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
    this.combat.machine.on('combat:attack', (data: CombatAttackSummary) => {
      var _done = this.combat.machine.notifyWait();
      var msg: string = '';
      var a = data.attacker.model.get('name');
      var b = data.defender.model.get('name');
      if (data.damage > 0) {
        msg = a + " attacked " + b + " for " + data.damage + " damage!";
      }
      else if (data.damage < 0) {
        msg = a + " healed " + b + " for " + Math.abs(data.damage) + " hit points";
      }
      else {
        msg = a + " attacked " + b + ", and MISSED!";
      }
      this.applyDamage(data.defender, data.damage);
      this.notify.show(msg, _done);
    });
    this.combat.machine.on('combat:run', (data: CombatRunSummary)=> {
      var _done = this.combat.machine.notifyWait();
      var msg: string = data.player.model.get('name');
      if (data.success) {
        msg += ' bravely ran away!';
      }
      else {
        msg += ' failed to escape!';
      }
      this.notify.show(msg, _done);
    });
    this.combat.machine.on('combat:victory', (data: CombatVictorySummary) => {
      var _done = this.combat.machine.notifyWait();
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
    this.combat.machine.on('combat:defeat', (data: CombatDefeatSummary) => {
      var done = this.combat.machine.notifyWait();
      this.notify.show("Your party was defeated...", () => {
        this.game.initGame().then(done);
      }, 0);
    });

  }
}
