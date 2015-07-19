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

import * as rpg from '../game';

import {GameEntityObject} from '../objects/gameEntityObject';

import {GameStateModel} from '../models/gameStateModel';

import {GameStateMachine} from './gameStateMachine';
import {CombatStateMachine} from './combat/combatStateMachine';
import {GameTileMap} from '../gameTileMap';
import {GameWorld} from '../gameWorld';

import {HeroModel} from '../models/heroModel';
import {CreatureModel} from '../models/creatureModel';



/**
 * Completion callback for a player action.
 */
export interface IPlayerActionCallback {
  (action:IPlayerAction, error?:any):void;
}
/**
 * A Player action during combat
 */
export interface IPlayerAction {
  name:string;
  from:GameEntityObject;
  to:GameEntityObject;
  act(then?:IPlayerActionCallback):boolean;
}
export interface CombatAttackSummary {
  damage:number;
  attacker:GameEntityObject;
  defender:GameEntityObject;
}




// Combat Lifetime State Machine
//--------------------------------------------------------------------------

/**
 * Construct a combat scene with appropriate GameEntityObjects for the players
 * and enemies.
 */
export class PlayerCombatState extends pow2.State {
  static NAME:string = "combat";
  name:string = PlayerCombatState.NAME;
  machine:CombatStateMachine = null;
  parent:GameStateMachine = null;
  tileMap:GameTileMap;
  finished:boolean = false; // Trigger state to exit when true.

  /**
   * The scene that combat happens in
   */
  scene:pow2.scene.Scene = null;

  factory:pow2.EntityContainerResource;
  spreadsheet:pow2.GameDataResource;

  constructor() {
    super();
    this.factory = GameWorld.get().entities;
    GameStateModel.getDataSource((spreadsheet:pow2.GameDataResource) => {
      this.spreadsheet = spreadsheet;
    });
  }

  enter(machine:GameStateMachine) {
    super.enter(machine);
    this.parent = machine;
    this.machine = new CombatStateMachine(machine);
    this.scene = new pow2.scene.Scene();
    machine.world.mark(this.scene);
    if (!this.factory || !this.spreadsheet) {
      throw new Error("Invalid combat entity container or game data spreadsheet");
    }


    // Build party
    _.each(machine.model.party, (hero:HeroModel, index:number) => {
      var heroEntity:GameEntityObject = this.factory.createObject('CombatPlayer', {
        model: hero,
        combat: this
      });
      if (!heroEntity) {
        throw new Error("Entity failed to validate with given inputs");
      }
      if (!heroEntity.isDefeated()) {
        heroEntity.icon = hero.get('icon');
        this.machine.party.push(heroEntity);
        this.scene.addObject(heroEntity);
      }
    });


    var mapUrl:string = machine.world.getMapUrl('combat');
    machine.world.loader.load(mapUrl, (map:pow2.TiledTMXResource)=> {

      this.tileMap = this.factory.createObject('GameCombatMap', {
        resource: map
      });

      // Hide all layers that don't correspond to the current combat zone
      var zone:rpg.IZoneMatch = machine.encounterInfo;
      var visibleZone:string = zone.target || zone.map;
      _.each(this.tileMap.getLayers(), (l)=> {
        l.visible = (l.name === visibleZone);
      });
      this.tileMap.dirtyLayers = true;
      this.scene.addObject(this.tileMap);

      // Position Party/Enemies

      // Get enemies data from spreadsheet
      var enemyList:any[] = this.spreadsheet.getSheetData("enemies");
      var enemiesLength:number = machine.encounter.enemies.length;
      for (var i:number = 0; i < enemiesLength; i++) {
        var tpl = _.where(enemyList, {id: machine.encounter.enemies[i]});
        if (tpl.length === 0) {
          continue;
        }
        var nmeModel = new CreatureModel(tpl[0]);

        var nme:GameEntityObject = this.factory.createObject('CombatEnemy', {
          model: nmeModel,
          combat: this,
          sprite: {
            name: "enemy",
            icon: nmeModel.get('icon')
          }
        });
        if (!nme) {
          throw new Error("Entity failed to validate with given inputs");
        }
        this.scene.addObject(nme);
        this.machine.enemies.push(nme);
      }
      if (this.machine.enemies.length) {
        _.each(this.machine.party, (heroEntity:GameEntityObject, index:number) => {
          var battleSpawn = this.tileMap.getFeature('p' + (index + 1));
          heroEntity.setPoint(new pow2.Point(battleSpawn.x / 16, battleSpawn.y / 16));
        });

        _.each(this.machine.enemies, (enemyEntity:GameEntityObject, index:number) => {
          var battleSpawn = this.tileMap.getFeature('e' + (index + 1));
          if (battleSpawn) {
            enemyEntity.setPoint(new pow2.Point(battleSpawn.x / 16, battleSpawn.y / 16));
          }
        });
        machine.trigger('combat:begin', this);
        this.machine.update(this);
      }
      else {
        // TODO: This is an error, I think.  Player entered combat with no valid enemies.
        machine.trigger('combat:end', this);
      }

    });
  }

  exit(machine:GameStateMachine) {
    machine.trigger('combat:end', this);
    if (this.scene) {
      machine.world.erase(this.scene);
      this.scene.destroy();
      this.scene = null;
    }
    if(this.tileMap){
      this.tileMap.destroy();
      this.tileMap = null;
    }
    this.finished = false;
    this.machine = null;
    this.parent = null;
  }
}
