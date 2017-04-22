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
import * as _ from 'underscore';
import {GameStateModel} from '../../game/rpg/models/gameStateModel';
import {Scene} from '../../game/pow2/scene/scene';
import {EntityFactory} from '../../game/pow-core/resources/entities.resource';
import {GameDataResource} from '../models/game-data/game-data.resource';
import {registerSprites} from '../../game/pow2/core/api';
import {RPG_GAME_ENTITIES} from '../scene/game.entities';
import {Subject} from 'rxjs/Subject';
import {ReplaySubject, Observable} from 'rxjs/Rx';
import {JSONResource} from '../../game/pow-core/resources/json.resource';
import {Injectable} from '@angular/core';
import {ResourceManager} from '../../game/pow-core/resource-manager';
import {PowInput} from '../../game/pow2/core/input';
import {World} from '../../game/pow-core/world';
import {SpriteRender} from './sprite-render';
import {AppState} from '../app.model';
import {Store} from '@ngrx/store';
import {CombatFixedEncounter, Combatant, IZoneMatch} from '../models/combat/combat.model';
import {CombatFixedEncounterAction} from '../models/combat/combat.actions';
import {
  IGameEncounterCallback,
  ITemplateEncounter,
  ITemplateFixedEncounter, ITemplateItem,
  SPREADSHEET_ID
} from '../models/game-data/game-data.model';
import {GameDataAddSheetAction} from '../models/game-data/game-data.actions';

let _sharedGameWorld: GameWorld = null;

@Injectable()
export class GameWorld extends World {
  input: PowInput = new PowInput();
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

  constructor(public loader: ResourceManager, public store: Store<AppState>, public sprites: SpriteRender) {
    super();
    _sharedGameWorld = this;
    this.mark(this.scene);
    // Preload sprite sheets
    this.loadSprites()
      .then(() => this.loadGameData())
      .then(() => this._ready$.next())
      .catch((e) => console.error(e));
  }

  static get(): GameWorld {
    return _sharedGameWorld;
  }

  // TODO: Remove this encounter code from here. Handled in combat feature and random encounter compoennts

  private _encounterCallback: IGameEncounterCallback = null;

  reportEncounterResult(victory: boolean) {
    if (this._encounterCallback) {
      this._encounterCallback(victory);
      this._encounterCallback = null;
    }
  }

  randomEncounter(zone: IZoneMatch, then?: IGameEncounterCallback) {
    const gsr = this.spreadsheet;
    const encountersData = gsr.getSheetData('randomencounters');
    const encounters: ITemplateFixedEncounter[] = _.filter(encountersData, (enc: any) => {
      return _.indexOf(enc.zones, zone.map) !== -1 || _.indexOf(enc.zones, zone.target) !== -1;
    });
    if (encounters.length === 0) {
      if (then) {
        then(true);
      }
      return;
    }
    const max = encounters.length - 1;
    const min = 0;
    const encounter = encounters[Math.floor(Math.random() * (max - min + 1)) + min];
    this.doEncounter(zone, encounter, then);
  }

  fixedEncounter(zone: IZoneMatch, encounterId: string, then?: IGameEncounterCallback) {
    const gsr = this.spreadsheet;
    const encounter = _.where(gsr.getSheetData('fixedencounters'), {
      id: encounterId
    })[0] as ITemplateFixedEncounter;
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
  itemModelFromId<T>(modelId: string): T {
    if (!this.spreadsheet) {
      return null;
    }
    const data = this.spreadsheet;
    const sheets: string[] = ['weapons', 'armor', 'items'];
    let item: T = null;
    while (!item && sheets.length > 0) {
      const sheetName = sheets.shift();
      const itemData: ITemplateItem = _.find(data.getSheetData(sheetName), (w: ITemplateItem) => w.id === modelId);
      if (itemData) {
        // TODO: How to deal with item creation?
        console.warn('revisit GameWorld.itemModelFromId - todo');
        switch (sheetName) {
          case 'weapons':
            item = itemData as any; // <any>new WeaponModel(itemData);
            break;
          case 'armor':
            item = itemData as any; // <any>new ArmorModel(itemData);
            break;
          case 'items':
            item = itemData as any; // <any>new UsableModel(itemData);
            break;
          default:
            console.warn('unknown sheet name: ' + sheetName);
            break;
        }
      }
    }
    return item;
  }

  private doEncounter(zoneInfo: IZoneMatch, encounter: ITemplateEncounter, then?: IGameEncounterCallback) {

    const enemyList: any[] = this.spreadsheet.getSheetData('enemies');
    const toCombatant = (id: string): Combatant => {
      const itemTemplate = _.where(enemyList, {
        id
      })[0];
      itemTemplate.maxhp = itemTemplate.hp;
      itemTemplate.maxmp = itemTemplate.mp;
      return Object.assign({}, itemTemplate) as Combatant;
    };

    const payload: CombatFixedEncounter = {
      id: encounter.id,
      enemies: encounter.enemies.map(toCombatant),
      zone: zoneInfo.target,
      message: encounter.message,
      party: [] // TODO: entity
    };
    this.store.dispatch(new CombatFixedEncounterAction(payload));
  }

  /** Load game data from google spreadsheet */
  private loadGameData(): Promise<void> {
    return this.loader.loadAsType(SPREADSHEET_ID, GameDataResource).then((resource: GameDataResource) => {
      this.store.dispatch(new GameDataAddSheetAction('weapons', resource.data.weapons));
      this.store.dispatch(new GameDataAddSheetAction('armor', resource.data.armor));
      this.store.dispatch(new GameDataAddSheetAction('items', resource.data.items));
      this.store.dispatch(new GameDataAddSheetAction('enemies', resource.data.enemies));
      this.store.dispatch(new GameDataAddSheetAction('magic', resource.data.magic));
      this.store.dispatch(new GameDataAddSheetAction('classes', resource.data.classes));
      this.store.dispatch(new GameDataAddSheetAction('randomEncounters', resource.data.randomencounters));
      this.store.dispatch(new GameDataAddSheetAction('fixedEncounters', resource.data.fixedencounters));
      this.spreadsheet = resource;
    });
  }

  /** Preload sprite sheet metadata */
  private loadSprites(): Promise<void> {
    return this.loader.load('assets/images/index.json')
      .then((res: JSONResource[]) => {
        const jsonRes = res[0];
        const sources = _.map(jsonRes.data, (baseName: string) => {
          return `${baseName}.json`;
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
        })).then(() => Promise.resolve<void>(undefined));
      });
  }
}
