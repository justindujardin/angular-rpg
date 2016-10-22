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
import * as rpg from '../../game/rpg/game';
import {GameStateModel} from '../../game/rpg/models/gameStateModel';
import {ItemModel, WeaponModel, ArmorModel, UsableModel} from '../../game/rpg/models/all';
import {Scene} from '../../game/pow2/scene/scene';
import {EntityFactory} from '../../game/pow-core/resources/entities';
import {GameDataResource} from '../../game/pow2/game/resources/gameData';
import {registerSprites, SPREADSHEET_ID} from '../../game/pow2/core/api';
import {RPG_GAME_ENTITIES} from '../../game/game.entities';
import {Subject} from 'rxjs/Subject';
import {ReplaySubject, Observable} from 'rxjs/Rx';
import {JSONResource} from '../../game/pow-core/resources/json';
import {Injectable} from '@angular/core';
import {ResourceLoader} from '../../game/pow-core/resourceLoader';
import {PowInput} from '../../game/pow2/core/input';
import {World} from '../../game/pow-core/world';
import {SpriteRender} from './spriteRender';
import {AppState} from '../app.model';
import {Store} from '@ngrx/store';
import {CombatFixedEncounter, Combatant} from '../models/combat/combat.model';
import {CombatFixedEncounterAction} from '../models/combat/combat.actions';


var _sharedGameWorld: GameWorld = null;

@Injectable()
export class GameWorld extends World {
  input: PowInput = new PowInput();
  model: GameStateModel = new GameStateModel();
  scene: Scene = new Scene();

  /**
   * RPG game entities factory.
   *
   * Use to instantiate composite game objects.
   */
  entities: EntityFactory = new EntityFactory(RPG_GAME_ENTITIES);

  /**
   * Subject that emits when the game world has been loaded and is
   * ready to be interacted with.
   */
  private _ready$: Subject<void> = new ReplaySubject<void>(1);
  ready$: Observable<void> = this._ready$;

  /**
   * Access to the game's Google Doc spreadsheet configuration.  For more
   * information, see [GameDataResource].
   */
  spreadsheet: GameDataResource = null;

  constructor(public loader: ResourceLoader, public store: Store<AppState>, public sprites: SpriteRender) {
    super();
    _sharedGameWorld = this;
    this.mark(this.scene);
    this.mark(this.model);
    // Preload sprite sheets
    this.loadSprites()
      .then(() => this.loadGameData())
      .then(() => this._ready$.next())
      .catch((e) => console.error(e));
  }

  static get(): GameWorld {
    return _sharedGameWorld;
  }

  private _encounterCallback: rpg.IGameEncounterCallback = null;

  reportEncounterResult(victory: boolean) {
    if (this._encounterCallback) {
      this._encounterCallback(victory);
      this._encounterCallback = null;
    }
  }

  randomEncounter(zone: rpg.IZoneMatch, then?: rpg.IGameEncounterCallback) {
    const gsr = this.spreadsheet;
    var encountersData = gsr.getSheetData('randomencounters');
    var encounters: rpg.IGameRandomEncounter[] = _.filter(encountersData, (enc: any) => {
      return _.indexOf(enc.zones, zone.map) !== -1 || _.indexOf(enc.zones, zone.target) !== -1;
    });
    if (encounters.length === 0) {
      then && then(true);
      return;
    }
    var max = encounters.length - 1;
    var min = 0;
    var encounter = encounters[Math.floor(Math.random() * (max - min + 1)) + min];
    this.doEncounter(zone, encounter, then);
  }


  fixedEncounter(zone: rpg.IZoneMatch, encounterId: string, then?: rpg.IGameEncounterCallback) {
    const gsr = this.spreadsheet;
    var encounter = <rpg.IGameFixedEncounter>_.where(gsr.getSheetData('fixedencounters'), {
      id: encounterId
    })[0];
    if (!encounter) {
      this.scene.trigger('error', `No encounter found with id: ${encounterId}`);
      return then(true);
    }
    this.doEncounter(zone, encounter, then);
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


  private doEncounter(zoneInfo: rpg.IZoneMatch, encounter: rpg.IGameEncounter, then?: rpg.IGameEncounterCallback) {

    const enemyList: any[] = this.spreadsheet.getSheetData('enemies');
    const toCombatant = (id: string): Combatant => {
      const itemTemplate = _.where(enemyList, {
        id: id
      })[0];
      return Object.assign({}, itemTemplate) as any;
    };

    const payload: CombatFixedEncounter = {
      id: encounter.id,
      enemies: encounter.enemies.map(toCombatant),
      party: []
    };

    this.store.dispatch(new CombatFixedEncounterAction(payload));

    this.scene.trigger('combat:encounter', this);
    // this.state.encounter = encounter;
    // this.state.encounterInfo = zoneInfo;
    // this.state.setCurrentState(PlayerCombatState.NAME);
    this._encounterCallback = then;
  }


  /** Load game data from google spreadsheet */
  private loadGameData(): Promise<void> {
    return this.loader.loadAsType(SPREADSHEET_ID, GameDataResource).then((resource: GameDataResource) => {
      this.spreadsheet = resource;
    });
  }

  /** Preload sprite sheet metadata */
  private loadSprites(): Promise<void> {
    return this.loader.load('assets/images/index.json')
      .then((res: JSONResource[]) => {
        const jsonRes = res[0];
        const sources = _.map(jsonRes.data, (baseName: string) => {
          return `${baseName}.json`
        });
        return Promise.all(_.map(sources, (fileName: string) => {
          return this.loader.load(fileName)
            .then((spritesLoaded: JSONResource[]) => {
              const meta = spritesLoaded[0];
              const name = meta.url
                .substr(0, meta.url.lastIndexOf('.'))
                .substr(meta.url.lastIndexOf('/') + 1);
              registerSprites(name, meta.data);
            });
        }));
      });
  }
}
