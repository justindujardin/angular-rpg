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
import {GameWorld} from './gameWorld';
import {GameTileMap} from '../../game/gameTileMap';
import {ItemModel} from '../../game/rpg/models/itemModel';
import {GameEntityObject} from '../../game/rpg/objects/gameEntityObject';
import {GameStateMachine} from '../../game/rpg/states/gameStateMachine';
import {ResourceLoader} from '../../game/pow-core/resourceLoader';
import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {GameStateLoadAction} from '../models/game-state/game-state.actions';
import {AppState} from '../app.model';
import {Point} from '../../game/pow-core';
import {GameState} from '../models/game-state/game-state.model';
import * as _ from 'underscore';
import {PartyMember} from '../models/entity/entity.model';

@Injectable()
export class RPGGame {
  styleBackground: string = 'rgba(0,0,0,1)';
  private _renderCanvas: HTMLCanvasElement;
  private _canvasAcquired: boolean = false;
  private _stateKey: string = '_angular2PowRPGState';

  constructor(public loader: ResourceLoader,
              public world: GameWorld,
              private store: Store<AppState>) {
    this._renderCanvas = document.createElement('canvas') as HTMLCanvasElement;
    this._renderCanvas.width = this._renderCanvas.height = 64;
    this._renderCanvas.style.position = 'absolute';
    this._renderCanvas.style.left = this._renderCanvas.style.top = '-9000px';
    this.world.time.start();
    this.store.subscribe();
  }

  getSaveData(): any {
    return localStorage.getItem(this._stateKey);
  }

  resetGame() {
    localStorage.removeItem(this._stateKey);
  }

  saveGame() {
    throw new Error('to reimplement with redux store');
    // const entity = <PlayerComponent>this.world.scene.componentByType(PlayerComponent);
    // if (entity) {
    //   this.world.model.setKeyData('playerPosition', entity.host.point);
    // }
    // this.world.model.setKeyData('playerMap', this.partyMapName);
    // const data = JSON.stringify(this.world.model.toJSON());
    // localStorage.setItem(this._stateKey, data);
  }

  /** Create a detached player entity that can be added to an arbitrary scene. */
  createPlayer(from: PartyMember, tileMap: GameTileMap, at?: Point): Promise<GameEntityObject> {
    if (!from) {
      return Promise.reject('Cannot create player without valid model');
    }
    const heroModel = Object.assign({}, from);
    if (!this.world.entities.data) {
      return Promise.reject('Cannot create player before entities container is loaded');
    }
    return this.world.entities
      .createObject('GameMapPlayer', {
        model: heroModel,
        map: tileMap
      })
      .then((sprite: GameEntityObject): GameEntityObject|Promise<GameEntityObject> => {
        if (!sprite) {
          return Promise.reject('Failed to create map player');
        }
        sprite.name = from.name;
        sprite.icon = from.icon;
        return sprite;
      });
  }

  // awardLevelUp() {
  //   var nextLevel: number = this.attributes.level + 1;
  //   var newHP = this.getHPForLevel(nextLevel);
  //   this.set({
  //     level: nextLevel,
  //     maxhp: newHP,
  //     // REMOVE auto-heal when you level up.  I think I'd rather people die from time-to-time.
  //     //hp: newHP,
  //     strength: this.getStrengthForLevel(nextLevel),
  //     agility: this.getAgilityForLevel(nextLevel),
  //     vitality: this.getVitalityForLevel(nextLevel),
  //     intelligence: this.getIntelligenceForLevel(nextLevel),
  //
  //     nextLevelExp: this.getXPForLevel(nextLevel + 1),
  //     prevLevelExp: this.getXPForLevel(nextLevel)
  //   });
  //   this.trigger('levelUp', this);
  // }

  static create(type: string, name: string) {
    const HERO_DEFAULTS = {
      id: 'invalid-hero',
      name: 'Hero',
      icon: '',
      combatSprite: '',
      // type: HeroTypes.Warrior,
      level: 1,
      exp: 0,
      nextLevelExp: 0,
      prevLevelExp: 0,
      hp: 0,
      maxhp: 6,
      description: '',
      // Hidden attributes.
      baseStrength: 0,
      baseAgility: 0,
      baseIntelligence: 0,
      baseVitality: 0,
      hitpercent: 5,
      hitPercentPerLevel: 1,
      evade: 0,
      strength: 5,
      vitality: 4,
      intelligence: 1,
      agility: 1,
    };
    let character: PartyMember = null;
    switch (type) {
      case 'warrior':
        character = _.extend({}, HERO_DEFAULTS, {
          type,
          level: 0,
          name,
          icon: 'warrior-male.png',
          baseStrength: 10,
          baseAgility: 2,
          baseIntelligence: 1,
          baseVitality: 7,
          hitpercent: 10,
          hitPercentPerLevel: 3
        });
        break;
      case 'lifemage':
        character = _.extend({}, HERO_DEFAULTS, {
          type,
          name,
          level: 0,
          icon: 'magician-female.png',
          baseStrength: 1,
          baseAgility: 6,
          baseIntelligence: 9,
          baseVitality: 4,
          hitpercent: 5,
          hitPercentPerLevel: 1
        });
        break;
      case 'ranger':
        character = _.extend({}, HERO_DEFAULTS, {
          type,
          name,
          level: 0,
          icon: 'ranger-female.png',
          baseStrength: 3,
          baseAgility: 10,
          baseIntelligence: 2,
          baseVitality: 5,
          hitpercent: 7,
          hitPercentPerLevel: 2
        });
        break;
      case 'deathmage':
        character = _.extend({}, HERO_DEFAULTS, {
          type,
          name,
          level: 0,
          icon: 'magician-male.png',
          baseStrength: 2,
          baseAgility: 10,
          baseIntelligence: 4,
          baseVitality: 4,
          hitpercent: 5,
          hitPercentPerLevel: 2
        });
        break;
      default:
        throw new Error('Unknown character class: ' + type);
    }
    // character.awardLevelUp();
    // character.hp = character.maxhp;
    return character;
  }

  /**
   * Initialize the game and resolve a promise that indicates whether the game
   * is new or was loaded from save data.  Resolves with true if the game is new.
   */
  initGame(data: any = this.getSaveData()): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (data) {
        const json = JSON.parse(data);
        // Set the root game state
        this.store.dispatch(new GameStateLoadAction(json));
        const at = json.position;
        resolve(false);
      }
      else {
        // const gameData = _.pick(this.world.model.toJSON(), ['entity', 'gold']);
        const initialState: GameState = _.extend({}, {
          party: [
            RPGGame.create('warrior', 'Warrior'),
            RPGGame.create('ranger', 'Ranger'),
            RPGGame.create('lifemage', 'Mage'),
          ],
          keyData: {},
          gold: 0,
          combatZone: '',
          map: 'town',
          position: {x: 12, y: 5}
        });
        this.store.dispatch(new GameStateLoadAction(initialState));
        resolve(true);
      }
    });
  }

  /**
   * Returns a canvas rendering context that may be drawn to.  A corresponding
   * call to releaseRenderContext will return the drawn content of the context.
   */
  getRenderContext(width: number, height: number): CanvasRenderingContext2D {
    if (this._canvasAcquired) {
      throw new Error('Only one rendering canvas is available at a time.' +
        ' Check for calls to this function without corresponding releaseCanvas() calls.');
    }
    this._canvasAcquired = true;
    this._renderCanvas.width = width;
    this._renderCanvas.height = height;
    const context: any = this._renderCanvas.getContext('2d');
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    return context;
  }

  /**
   * Call this after getRenderContext to finish rendering and have the source
   * of the canvas content returned as a data url string.
   */
  releaseRenderContext(): string {
    this._canvasAcquired = false;
    return this._renderCanvas.toDataURL();
  }

}
