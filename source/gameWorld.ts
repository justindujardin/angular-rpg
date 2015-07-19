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

import * as rpg from './game';
import {GameStateMachine} from './states/gameStateMachine';
import {PlayerCombatState} from './states/playerCombatState';
import {GameStateModel} from './models/gameStateModel';
import {ItemModel,WeaponModel,ArmorModel,UsableModel,HeroModel} from './models/all';

var _sharedGameWorld:GameWorld = null;

declare var System:any;


// Patch getClassType to resolve ES6 modules as well as types on the window object.
var oldGetClassType:any = pow2.EntityContainerResource.getClassType;
pow2.EntityContainerResource.getClassType = (name:string) => {
  return GameWorld._typeDatabase[name];
};


export class GameWorld extends pow2.scene.SceneWorld {
  state:GameStateMachine;
  // TODO: Fix game loading and multiple scenes/maps state.
  // Put the game model here, and use the pow2.getWorld() api
  // for access to the game model.   Reset state methods should
  // exist there, and angular UI should listen in.
  model:GameStateModel;

  scene:pow2.scene.Scene;

  /**
   * RPG game entities factory.
   *
   * Use to instantiate .powEntities file composite objects.
   */
  entities:pow2.EntityContainerResource;

  events:pow2.Events = new pow2.Events();

  /**
   * Access to the game's Google Doc spreadsheet configuration.  For more
   * information, see [GameDataResource].
   */
  spreadsheet:pow2.GameDataResource = null;

  constructor(services?:any) {
    super(services);
    if (!this.scene) {
      this.setService('scene', new pow2.scene.Scene());
    }
    this.loader.registerType('powEntities', pow2.EntityContainerResource);
    GameStateModel.getDataSource((gsr:pow2.GameDataResource)=> {
      this.spreadsheet = gsr;
    });
    this.entities = <pow2.EntityContainerResource>this.loader
      .load(pow2.GAME_ROOT + 'entities/rpg.powEntities')
      .once(pow2.Resource.READY, () => {
        this._importEntityTypes().then(()=> {
          this.events.trigger('ready');
        }).catch((e)=> {
          console.error(e);
          this.events.trigger('error', e);
        });
      });
  }

  static get():GameWorld {
    if (!_sharedGameWorld) {
      _sharedGameWorld = new GameWorld();
    }
    return _sharedGameWorld;
  }

  private _nsTypeToImport(item:string):string {
    // Make the last component of the type camelCase to match file naming convention.
    var ns = item.split('.');
    var finalType = ns[ns.length - 1];
    ns[ns.length - 1] = finalType[0].toLowerCase() + finalType.substr(1);
    return ns.join('/');
  }

  private _importToNsType(item:string):string {
    // Make the last component of the type CapitalCase to match file naming convention.
    var ns = item.split('/');
    var finalType = ns[ns.length - 1];
    ns[ns.length - 1] = finalType[0].toUpperCase() + finalType.substr(1);
    return ns.join('.');
  }

  /**
   * Type database for looking up imported es6 modules as entity types
   * @private
   */
  static _typeDatabase:{
    [fullType:string]:Function
  } = {};

  /**
   * Resolve all the modules that need to be imported prior to creating
   * entities.  This is because the entity container does not have an
   * async API, so we need to resolve them ahead of time.
   * @private
   */
  private _importEntityTypes():Promise<void> {
    return new Promise<void>((resolve, reject)=> {
      // Find the types needed by the entities in the container
      var entities = this._getEntityContainerTypes(this.entities);
      // Exclude types that are already available on the window
      entities = _.filter(entities, (e:string) => {
        var t:any = oldGetClassType(e);
        if (t) {
          // Register window style types in the database as they're found.
          GameWorld._typeDatabase[e] = t;
        }
        return !t;
      });

      var types:string[] = _.map(entities, this._nsTypeToImport);
      var next = () => {
        if (types.length === 0) {
          resolve();
          return;
        }
        var instanceType = types.shift();
        //console.log("Importing entity type: " + instanceType);
        System.import(instanceType).then((module:any) => {
          //console.log("OKAY: " + instanceType);
          var nsType = this._importToNsType(instanceType);
          var typeName = nsType.substr(nsType.lastIndexOf('.') + 1);
          if (!module[typeName]) {
            reject("INVALID MODULE TYPE: " + instanceType);
          }
          GameWorld._typeDatabase[nsType] = module[typeName];

          next();
        }).catch(console.error.bind(console));
      };
      next();
    });
  }

  /**
   * Enumerate the module types needed for a given entity container resource.
   */
  private _getEntityContainerTypes(resource:pow2.EntityContainerResource):string[] {
    var types:string[] = [];
    _.each(resource.data, (templateData:any) => {
      types.push(templateData.type);
      if (templateData.depends) {
        _.each(templateData.depends, (d:string) => types.push(d));
      }
      if (templateData.inputs) {
        _.each(templateData.inputs, (type:string)=> {
          if (type.toLowerCase() !== 'object') {
            types.push(type);
          }
        });
      }
      _.each(templateData.components, (comp:any)=> {
        types.push(comp.type);
      });
    });
    return types;
  }

  private _encounterCallback:rpg.IGameEncounterCallback = null;

  reportEncounterResult(victory:boolean) {
    if (this._encounterCallback) {
      this._encounterCallback(victory);
      this._encounterCallback = null;
    }
  }

  getMapUrl(name:string):string {
    return 'maps/' + name + '.tmx';
  }

  randomEncounter(zone:rpg.IZoneMatch, then?:rpg.IGameEncounterCallback) {
    GameStateModel.getDataSource((gsr:pow2.GameDataResource)=> {
      var encountersData = gsr.getSheetData("randomencounters");
      var encounters:rpg.IGameRandomEncounter[] = _.filter(encountersData, (enc:any)=> {
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


  fixedEncounter(zone:rpg.IZoneMatch, encounterId:string, then?:rpg.IGameEncounterCallback) {
    GameStateModel.getDataSource((gsr:pow2.GameDataResource)=> {
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
  itemModelFromId<T extends Backbone.Model>(modelId:string):T {
    if (!this.spreadsheet) {
      return null;
    }
    var data = this.spreadsheet;
    var sheets:string[] = ['weapons', 'armor', 'items'];
    var item:T = null;
    while (!item && sheets.length > 0) {
      var sheetName = sheets.shift();
      var itemData:rpg.IGameItem = _.find(data.getSheetData(sheetName), (w:rpg.IGameItem) => w.id === modelId);
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


  private _encounter(zoneInfo:rpg.IZoneMatch, encounter:rpg.IGameEncounter, then?:rpg.IGameEncounterCallback) {
    this.scene.trigger('combat:encounter', this);
    this.state.encounter = encounter;
    this.state.encounterInfo = zoneInfo;
    this.state.setCurrentState(PlayerCombatState.NAME);
    this._encounterCallback = then;
  }
}
