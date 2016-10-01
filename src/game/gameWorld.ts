/*
 Copyright (C) 2013-2014 by Justin DuJardin

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

import * as Backbone from 'backbone';
import * as _ from 'underscore';
import * as rpg from './rpg/game';
import {GameStateMachine} from './rpg/states/gameStateMachine';
import {PlayerCombatState} from './rpg/states/playerCombatState';
import {GameStateModel} from './rpg/models/gameStateModel';
import {ItemModel, WeaponModel, ArmorModel, UsableModel} from './rpg/models/all';
import {SceneWorld} from './pow2/scene/sceneWorld';
import {Scene} from './pow2/scene/scene';
import {EntityContainerResource} from './pow-core/resources/entities';
import {Events} from './pow-core/events';
import {GameDataResource} from './pow2/game/resources/gameData';
import {GAME_ROOT} from './pow2/core/api';

var _sharedGameWorld: GameWorld = null;

declare var System: any;


export class GameWorld extends SceneWorld {
  state: GameStateMachine;
  model: GameStateModel;
  scene: Scene;

  /**
   * RPG game entities factory.
   *
   * Use to instantiate .powEntities file composite objects.
   */
  entities: EntityContainerResource;

  events: Events = new Events();

  /**
   * Access to the game's Google Doc spreadsheet configuration.  For more
   * information, see [GameDataResource].
   */
  spreadsheet: GameDataResource = null;

  constructor(services?: any) {
    super(services);
    if (!this.scene) {
      this.setService('scene', new Scene());
    }
    this.loader.registerType('powEntities', EntityContainerResource);
    GameStateModel.getDataSource((gsr: GameDataResource)=> {
      this.spreadsheet = gsr;
    });
    this.loader.load(`${GAME_ROOT}entities/rpg.powEntities`)
      .then((res: EntityContainerResource[]) => {
        this.entities = res[0];
        this.events.trigger('ready');
      })
      .catch((e)=> {
        console.error(e);
        this.events.trigger('error', e);
      });
  }

  static get(): GameWorld {
    if (!_sharedGameWorld) {
      _sharedGameWorld = new GameWorld();
    }
    return _sharedGameWorld;
  }

  private _encounterCallback: rpg.IGameEncounterCallback = null;

  reportEncounterResult(victory: boolean) {
    if (this._encounterCallback) {
      this._encounterCallback(victory);
      this._encounterCallback = null;
    }
  }

  getMapUrl(name: string): string {
    return `${GAME_ROOT}/maps/${name}.tmx`;
  }

  randomEncounter(zone: rpg.IZoneMatch, then?: rpg.IGameEncounterCallback) {
    GameStateModel.getDataSource((gsr: GameDataResource)=> {
      var encountersData = gsr.getSheetData("randomencounters");
      var encounters: rpg.IGameRandomEncounter[] = _.filter(encountersData, (enc: any)=> {
        return _.indexOf(enc.zones, zone.map) !== -1 || _.indexOf(enc.zones, zone.target) !== -1;
      });
      if (encounters.length === 0) {
        then && then(true);
        return;
      }
      var max = encounters.length - 1;
      var min = 0;
      var encounter = encounters[Math.floor(Math.random() * (max - min + 1)) + min];
      this._encounter(zone, encounter, then);
    });
  }


  fixedEncounter(zone: rpg.IZoneMatch, encounterId: string, then?: rpg.IGameEncounterCallback) {
    GameStateModel.getDataSource((gsr: GameDataResource)=> {
      var encounter = <rpg.IGameFixedEncounter>_.where(gsr.getSheetData("fixedencounters"), {
        id: encounterId
      })[0];
      if (!encounter) {
        this.scene.trigger('error', "No encounter found with id: " + encounterId);
        return then(true);
      }
      this._encounter(zone, encounter, then);
    });
  }

  /**
   * Create an ItemModel by a given hyphen-case id of an item described in the game data source.
   * @param modelId string The item id, e.g. `leather-shield` or `potion`
   * @returns {ItemModel|null} The model for the given item, or null.
   */
  itemModelFromId<T extends Backbone.Model>(modelId: string): T {
    if (!this.spreadsheet) {
      return null;
    }
    var data = this.spreadsheet;
    var sheets: string[] = ['weapons', 'armor', 'items'];
    var item: T = null;
    while (!item && sheets.length > 0) {
      var sheetName = sheets.shift();
      var itemData: rpg.IGameItem = _.find(data.getSheetData(sheetName), (w: rpg.IGameItem) => w.id === modelId);
      if (itemData) {
        switch (sheetName) {
          case 'weapons':
            item = <any>new WeaponModel(itemData);
            break;
          case 'armor':
            item = <any>new ArmorModel(itemData);
            break;
          case 'items':
            item = <any>new UsableModel(itemData);
            break;
        }
      }
    }
    return item;
  }


  private _encounter(zoneInfo: rpg.IZoneMatch, encounter: rpg.IGameEncounter, then?: rpg.IGameEncounterCallback) {
    this.scene.trigger('combat:encounter', this);
    this.state.encounter = encounter;
    this.state.encounterInfo = zoneInfo;
    this.state.setCurrentState(PlayerCombatState.NAME);
    this._encounterCallback = then;
  }
}
