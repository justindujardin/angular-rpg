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


import {Component, View, NgIf, NgFor, CSSClass, ElementRef, onDestroy} from 'angular2/angular2';
import {GameTileMap} from '../../gameTileMap';
import {CombatCameraComponent} from '../../components/combat/combatCameraComponent';
import {HeroModel} from '../../models/all';
import {GameEntityObject} from '../../objects/gameEntityObject';
import {CombatActionComponent} from '../../components/combat/combatActionComponent';
import {CombatStateMachine} from '../../states/combat/combatStateMachine';
import {ChooseActionStateMachine,ChooseActionType} from './chooseactionstates';
import {PlayerCombatState,CombatAttackSummary} from '../../states/playerCombatState';
import {CombatDefeatSummary,CombatVictorySummary,CombatRunSummary} from '../../states/combat/all';
import {IChooseActionEvent} from '../../states/combat/combatChooseActionState';
import {UIAttachment} from './chooseactionstates';
import {RPGGame,Animate, Notify} from '../services/all';
import {RPGHealthBar} from '../rpg/all';
import {Map} from '../map';

import {CombatDamage} from './combatdamage';

@Component({
  selector: 'combat-map',
  properties: ['targeting', 'choosingSpell', 'choosing', 'combat', 'map', 'damages'],
  host: {
    '(window:resize)': '_onResize($event)'
  }
})
@View({
  templateUrl: 'source/ui/combat/combatmap.html',
  directives: [NgIf, NgFor, CSSClass, CombatDamage, RPGHealthBar],
  lifecycle: [onDestroy]
})
export class CombatMap extends Map implements pow2.IProcessObject {
  pointer:UIAttachment = null;
  combatData:IChooseActionEvent = null;
  stateMachine:ChooseActionStateMachine = null;
  choosing:GameEntityObject = null;
  choosingSpell:pow2.game.components.PlayerCombatRenderComponent = null;
  targeting:boolean = false;
  combat:PlayerCombatState = null;

  // Damages displaying on screen.
  damages:any[] = [];

  // ???
  selectAction:any = null;
  selectSpell:any = null;
  selectTarget:any = null;

  objectRenderer:pow2.tile.render.TileObjectRenderer = new pow2.tile.render.TileObjectRenderer;
  mouse:pow2.NamedMouseElement = null;

  private _map:GameTileMap = null;
  set map(value:GameTileMap) {
    this._map = value;
    if (this._map) {
      this.setTileMap(value);
    }
  }

  get map():GameTileMap {
    return this._map;
  }


  constructor(public elRef:ElementRef, public game:RPGGame, public animate:Animate, public notify:Notify) {
    super(elRef, game);
    _.defer(() => this.initialize());
  }

  initialize() {
    _.defer(()=>this._onResize());
    this.camera.point.zero();
    this.camera.extent.set(25, 25);
    this.mouseClick = _.bind(this.mouseClick, this);
    this._bindRenderDamage();

    this.combat.scene.addView(this);
    this.game.world.time.addObject(this);

    var state = <PlayerCombatState>this.game.machine.getCurrentState();
    this.combat.machine.on('combat:chooseMoves', this.chooseTurns, this);

    this.pointer = {
      element: this.elRef.nativeElement.querySelector('.point-to-player'),
      object: null,
      offset: new pow2.Point()
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

  onAddToScene(scene:pow2.scene.Scene) {
    super.onAddToScene(scene);
    if(scene.world && scene.world.input){
      this.mouse = scene.world.input.mouseHook(this, "combat");
    }
    this.$el.on('click touchstart', this.mouseClick);
  }

  onRemoveFromScene(scene:pow2.scene.Scene) {
    if(scene.world && scene.world.input){
      scene.world.input.mouseUnhook("combat");
    }
    this.$el.off('click touchstart', this.mouseClick);
  }

  //
  // Time Processing
  //
  tick(elapsed:number) {
    if (!this || !this.pointer || !this.pointer.object) {
      return;
    }
    var targetPos:pow2.Point = this.pointer.object.point.clone();
    targetPos.y = (targetPos.y - this.camera.point.y) + this.pointer.offset.y;
    targetPos.x = (targetPos.x - this.camera.point.x) + this.pointer.offset.x;
    var screenPos:pow2.Point = this.worldToScreen(targetPos, this.cameraScale);
    var el:JQuery = $(this.pointer.element);
    el.css({
      left: screenPos.x,
      top: screenPos.y
    });
  }


  /**
   * Update the camera for this frame.
   */
  processCamera() {
    this.cameraComponent = <pow2.scene.components.CameraComponent>this.scene.componentByType(CombatCameraComponent);
    super.processCamera();
  }

  /**
   * Render the tile map, and any features it has.
   */
  renderFrame(elapsed:number) {
    super.renderFrame(elapsed);

    var players = this.scene.objectsByComponent(pow2.game.components.PlayerCombatRenderComponent);
    _.each(players, (player) => {
      this.objectRenderer.render(player, player, this);
    });

    var sprites = <pow2.ISceneComponent[]>this.scene.componentsByType(pow2.tile.components.SpriteComponent);
    _.each(sprites, (sprite:any) => {
      this.objectRenderer.render(sprite.host, sprite, this);
    });
    return this;
  }


  //
  // API
  //
  chooseTurns(data:IChooseActionEvent) {
    this.combatData = data;
    if (!this.combat.scene) {
      throw new Error("Invalid Combat Scene");
    }
    var chooseSubmit = (action:CombatActionComponent)=> {
      inputState.data.choose(action);
      next();
    };
    var inputState = new ChooseActionStateMachine(this, data, chooseSubmit);
    this.stateMachine = inputState;
    inputState.data = data;
    var choices:GameEntityObject[] = data.players.slice();
    var next = () => {
      var p:GameEntityObject = choices.shift();
      if (!p) {
        this.combatData = null;
        this.stateMachine = null;
        return;
      }
      inputState.current = p;
      inputState.setCurrentState(ChooseActionType.NAME);
    };
    next();
  }

  setPointerTarget(object:GameEntityObject, directionClass:string = "right", offset:pow2.Point = new pow2.Point()) {
    var el:JQuery = $(this.pointer.element);
    el.removeClass('left right');
    el.addClass(directionClass);
    if (this.pointer) {
      this.pointer.object = object;
      this.pointer.offset = offset;
    }
  }

  addPointerClass(clazz:string) {
    $(this.pointer.element).addClass(clazz);
  }

  removePointerClass(clazz:string) {
    $(this.pointer.element).removeClass(clazz);
  }


  getMemberClass(member, focused):any {
    var c = this.choosing;
    return {
      choosing: c && c.model && c.model.get('name') === member.model.get('name'),
      focused: focused && focused.model && member.model.get('name') === focused.model.get('name')
    };
  }

  getActions():CombatActionComponent[] {
    if (!this.choosing) {
      throw new Error("cannot get actions for non-existent game entity");
    }
    var results = _.filter(this.choosing.findComponents(CombatActionComponent), (c:CombatActionComponent)=> {
      return c.canBeUsedBy(this.choosing);
    });
    return results;
  }

  getSpells():any {
    if (!this.choosingSpell || !this.choosingSpell.host) {
      return [];
    }
    var host = <GameEntityObject>this.choosingSpell.host;
    var spells:any = host.getSpells();
    return spells;
  }

  getTargets():GameEntityObject[] {
    var result:GameEntityObject[] = [];
    var beneficial:boolean = this.stateMachine && this.stateMachine.spell && this.stateMachine.spell.benefit;
    if (this.combatData) {
      result = (beneficial ? this.combatData.players : this.combatData.enemies);
    }
    return result;
  }

  applyDamage(to:pow2.scene.SceneObject, value:number) {
    var targetPos:pow2.Point = to.point.clone();
    targetPos.y -= (this.camera.point.y + 1.25);
    targetPos.x -= this.camera.point.x;
    var screenPos:pow2.Point = this.worldToScreen(targetPos, this.cameraScale);
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

  //
  // GameCombatView
  //

  /**
   * Mouse input
   */
  mouseClick(e:any) {
    //console.log("clicked at " + this.mouse.world);
    var hits = [];
    pow2.Input.mouseOnView(e.originalEvent, this, this.mouse);
    if (this.combat.scene.db.queryPoint(this.mouse.world, GameEntityObject, hits)) {
      this.combat.scene.trigger('click', this.mouse, hits);
      e.stopImmediatePropagation();
      return false;
    }
  }


  private _bindRenderDamage() {
    this.combat.machine.on('combat:attack', (data:CombatAttackSummary)=> {
      var _done = this.combat.machine.notifyWait();
      var msg:string = '';
      var a = data.attacker.model.get('name');
      var b = data.defender.model.get('name');
      if (data.damage > 0) {
        msg = a + " attacked " + b + " for " + data.damage + " damage!";
      }
      else {
        msg = a + " attacked " + b + ", and MISSED!";
      }
      this.applyDamage(data.defender, data.damage);
      this.notify.show(msg, _done);
    });
    this.combat.machine.on('combat:run', (data:CombatRunSummary)=> {
      var _done = this.combat.machine.notifyWait();
      var msg:string = data.player.model.get('name');
      if (data.success) {
        msg += ' bravely ran away!';
      }
      else {
        msg += ' failed to escape!';
      }
      this.notify.show(msg, _done);
    });
    this.combat.machine.on('combat:victory', (data:CombatVictorySummary) => {
      var _done = this.combat.machine.notifyWait();
      this.notify.show("Found " + data.gold + " gold!", null, 0);
      this.notify.show("Gained " + data.exp + " experience!", null, 0);
      _.each(data.levels, (hero:HeroModel) => {
        this.notify.show(hero.get('name') + " reached level " + hero.get('level') + "!", null, 0);
      });
      this.notify.show("Enemies Defeated!", _done);
    });
    this.combat.machine.on('combat:defeat', (data:CombatDefeatSummary) => {
      this.notify.show("Your party was defeated...", () => {
      }, 0);
    });

  }
}
