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

/// <reference path="../typings/angular2/angular2.d.ts"/>
/// <reference path="../typings/es6-promise/es6-promise.d.ts"/>
/// <reference path="../bower_components/pow2/lib/pow2.d.ts" />
/// <reference path="../bower_components/pow2/types/backbone/backbone.d.ts" />

import {Component, View, bootstrap, NgFor, NgIf, ElementRef} from 'angular2/angular2';

import {GameWorld} from './gameWorld';
import {GameStateModel} from './models/gameStateModel';
import {GameStateMachine} from './states/gameStateMachine';
import {PlayerCombatState} from './states/playerCombatState';

import {RPGGame,Notify,Animate} from './ui/services/all';

import {CombatMap,CombatDamage} from './ui/combat/all';
import {RPGSprite,RPGHealthBar,RPGNotification} from './ui/rpg/all';
import {PartyInventory,PlayerCard,PartyMenu} from './ui/party/all';
import {WorldMap,WorldDialog,WorldStore,WorldTemple} from './ui/world/all';

import * as md from './ui/material/components/all';


/**
 * A Combat encounter descriptor.  Used to describe the configuration of combat.
 */
export interface IGameEncounter {
  id:string; // unique id in spreadsheet
  enemies:string[]; // array of enemies in this encounter
  message:string; // message to display when combat begins
}
/**
 * A Fixed combat encounter.
 *
 * Fixed encounters are ones that happen when you interact with some fixed part
 * of the game map.
 */
export interface IGameFixedEncounter extends IGameEncounter {
  gold?:number;
  experience?:number;
  items?:string[];
}
/**
 * A Random combat encounter.
 *
 * Random encounters happen during movement about a map that has a `CombatEncounterComponent`
 * added to it.
 */
export interface IGameRandomEncounter extends IGameEncounter {
  zones:string[]; // array of zones this encounter can happen in
}

/**
 * Callback when
 */
export interface IGameEncounterCallback {
  (victory:boolean):void;
}

//
// Models
//
export interface IGameItem {
  id?:string; // the `hyphen-case-named` item id
  name:string; // The item name
  cost:number; // The cost of this item
  icon:string; // Sprite icon name, e.g. LongSword.png
  usedby?:any[]; // `HeroType`s that can use this item.
}

export interface IGameUsable extends IGameItem {
  effects:string[]; // Array of effects to apply to user of item
}

export interface IGameSpell extends IGameItem {
  type:string; // apply on 'target' or 'group'
  elements:string; // what kind of magic
  benefit:boolean; // hurt/heal
  value:number; // the impact
  level:number; // minimum level to use the spell
}

export interface IGameWeapon extends IGameItem {
  attack:number; // Damage value
  hit:number; // 0-100%
}

export interface IGameArmor extends IGameItem {
  defense:number; // Defensive value
  evade:number; // Value to add to evasion <= 0
}


/**
 * Describe a set of combat zones for a given point on a map.
 */
export interface IZoneMatch {
  /**
   * The zone name for the current map
   */
  map:string;
  /**
   * The zone name for the target location on the map
   */
  target:string;
  /**
   * The point that target refers to.
   */
  targetPoint:pow2.Point;

  /**
   * Fixed or random?
   */
  fixed:boolean;
}

@Component({
  selector: 'rpg-game',
  hostInjector: [RPGGame, Notify, Animate],
  properties: ['loaded', 'game', 'combat']
})
@View({
  templateUrl: 'source/game.html',
  directives: [
    NgFor, NgIf,
    WorldMap, WorldDialog, WorldStore, WorldTemple,
    CombatMap, CombatDamage,
    PlayerCard,
    PartyInventory, PartyMenu,
    md.MdProgressLinear, md.MdButton,
    RPGSprite, RPGNotification, RPGHealthBar]
})
export class RPGAppComponent {
  maps:string[] = [
    'castle', 'crypt', 'fortress1',
    'fortress2', 'isle', 'keep',
    'lair', 'port', 'ruins', 'sewer',
    'tower1', 'tower2', 'tower3', 'town',
    'village', 'wilderness'
  ];
  loaded:boolean = true;

  setMap(value:string) {
    this.game.partyPosition.zero();
    this.game.partyMapName = value;
  }

  combat:PlayerCombatState = null;

  constructor(public game:RPGGame, public notify:Notify) {
    game.initGame().then((newGame:boolean)=> {
      game.machine.on('combat:begin', (state:PlayerCombatState) => {
        this.game.world.scene.paused = true;
        this.combat = state;
      });
      game.machine.on('combat:end', () => {
        this.game.world.scene.paused = false;
        this.combat = null;
      });
      console.log("Game fully initialized.");
      if (newGame) {
        var msgs:string[] = [
          'Urrrrrgh.', 'What is this?',
          'Why am I facing a wall in a strange town?',
          'Oh well, it is probably not important.',
          'I better take a look around',
        ];
        msgs.forEach((m:string) => this.notify.show(m, null, 0));
      }
    }).catch(console.error.bind(console));
  }
}

export function load():Promise<void> {
  return new Promise<void>((resolve, reject)=> {
    var world = new GameWorld({
      model: new GameStateModel(),
      state: new GameStateMachine()
    });
    world.events.once('ready', ()=> {
      try {
        bootstrap(RPGAppComponent);
        resolve();
      }
      catch (e) {
        reject(e);
      }
    });
    world.events.once('error', reject);
    pow2.registerWorld('rpg', world);
  });
}
