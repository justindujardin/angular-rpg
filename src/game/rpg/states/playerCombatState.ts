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
import {GameStateMachine} from './gameStateMachine';
import {CombatStateMachine} from './combat/combatStateMachine';
import {GameTileMap} from '../../gameTileMap';
import {GameWorld} from '../../../app/services/gameWorld';
import {HeroModel} from '../models/heroModel';
import {CreatureModel} from '../models/creatureModel';
import {State} from '../../pow2/core/state';
import {Scene} from '../../pow2/scene/scene';
import {EntityFactory} from '../../pow-core/resources/entities';
import {TiledTMXResource} from '../../pow-core/resources/tiled/tiledTmx';
import {Point} from '../../pow-core/point';
import * as _ from 'underscore';
import {getMapUrl} from '../../pow2/core/api';


/**
 * Completion callback for a player action.
 */
export interface IPlayerActionCallback {
  (action: IPlayerAction, error?: any): void;
}
/**
 * A Player action during combat
 */
export interface IPlayerAction {
  name: string;
  from: GameEntityObject;
  to: GameEntityObject;
  act(then?: IPlayerActionCallback): boolean;
}
export interface CombatAttackSummary {
  damage: number;
  attacker: GameEntityObject;
  defender: GameEntityObject;
}


// Combat Lifetime State Machine
//--------------------------------------------------------------------------

/**
 * Construct a combat scene with appropriate GameEntityObjects for the players
 * and enemies.
 */
export class PlayerCombatState extends State {
  static NAME: string = "combat";
  name: string = PlayerCombatState.NAME;
  machine: CombatStateMachine = null;
  parent: GameStateMachine = null;
  tileMap: GameTileMap;
  finished: boolean = false; // Trigger state to exit when true.

  /**
   * The scene that combat happens in
   */
  scene: Scene = null;

  factory: EntityFactory;

  enter(machine: GameStateMachine) {
    super.enter(machine);
    this.factory = GameWorld.get().entities;
    this.parent = machine;
    this.machine = new CombatStateMachine(machine);
    this.scene = new Scene();
    machine.world.mark(this.scene);
    const spreadsheet = this.parent.world.spreadsheet;
    if (!this.factory || !spreadsheet) {
      throw new Error("Invalid combat entity container or game data spreadsheet");
    }

    let promise: Promise<any> = Promise.resolve();

    // Build party
    _.each(machine.world.model.party, (hero: HeroModel, index: number) => {
      const config = {
        model: hero,
        combat: this
      };
      promise = promise.then(() => {
        return this.factory.createObject('CombatPlayer', config)
          .then((heroEntity: GameEntityObject) => {
            if (!heroEntity.isDefeated()) {
              heroEntity.icon = hero.get('icon');
              this.machine.party.push(heroEntity);
              this.scene.addObject(heroEntity);
            }
          });
      })
    });


    promise
      .then(() => {
        var mapUrl: string = getMapUrl('combat');
        return machine.world.loader.load(mapUrl);
      })
      .then((maps: TiledTMXResource[]) => {
        return this.factory.createObject('GameCombatMap', {
          resource: maps[0]
        });
      })
      .then((map: GameTileMap) => {
        this.tileMap = map;
        // Hide all layers that don't correspond to the current combat zone
        var zone: rpg.IZoneMatch = machine.encounterInfo;
        var visibleZone: string = zone.target || zone.map;
        _.each(this.tileMap.getLayers(), (l)=> {
          l.visible = (l.name === visibleZone);
        });
        this.tileMap.dirtyLayers = true;
        this.scene.addObject(this.tileMap);

        // Position Party/Enemies
        let enemyPromises = [];

        // Get enemies data from spreadsheet
        var enemyList: any[] = spreadsheet.getSheetData("enemies");
        var enemiesLength: number = machine.encounter.enemies.length;
        for (var i: number = 0; i < enemiesLength; i++) {
          var tpl = _.where(enemyList, {id: machine.encounter.enemies[i]});
          if (tpl.length === 0) {
            continue;
          }
          var enemyModel = new CreatureModel(tpl[0]);

          let createEnemyPromise = this.factory.createObject('CombatEnemy', {
            model: enemyModel,
            combat: this,
            sprite: {
              name: "enemy",
              icon: enemyModel.get('icon')
            }
          });
          createEnemyPromise = createEnemyPromise.then((nme: GameEntityObject) => {
            if (!nme) {
              throw new Error("Entity failed to validate with given inputs");
            }
            this.scene.addObject(nme);
            this.machine.enemies.push(nme);
          });
          enemyPromises.push(createEnemyPromise);
        }
        return Promise.all(enemyPromises);
      })
      .then(() => {

        if (this.machine.enemies.length) {
          _.each(this.machine.party, (heroEntity: GameEntityObject, index: number) => {
            var battleSpawn = this.tileMap.getFeature('p' + (index + 1));
            heroEntity.setPoint(new Point(battleSpawn.x / 16, battleSpawn.y / 16));
          });

          _.each(this.machine.enemies, (enemyEntity: GameEntityObject, index: number) => {
            var battleSpawn = this.tileMap.getFeature('e' + (index + 1));
            if (battleSpawn) {
              enemyEntity.setPoint(new Point(battleSpawn.x / 16, battleSpawn.y / 16));
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

  exit(machine: GameStateMachine) {
    machine.trigger('combat:end', this);
    if (this.scene) {
      machine.world.erase(this.scene);
      this.scene.destroy();
      this.scene = null;
    }
    if (this.tileMap) {
      this.tileMap.destroy();
      this.tileMap = null;
    }
    this.finished = false;
    this.machine = null;
    this.parent = null;
  }
}
