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

import * as rpg from '../../game';

import {GameEntityObject} from '../../objects/gameEntityObject';
import {GameStateMachine} from '../gameStateMachine';
import {GameTileMap} from '../../gameTileMap';
import {GameWorld} from '../../gameWorld';


import {GameStateModel} from '../../models/gameStateModel';

import {IPlayerAction} from '../playerCombatState';
import {CombatBeginTurnState} from './combatBeginTurnState';
import {CombatChooseActionState} from './combatChooseActionState';
import {CombatDefeatState} from './combatDefeatState';
import {CombatEndTurnState} from './combatEndTurnState';
import {CombatEscapeState} from './combatEscapeState';
import {CombatStartState} from './combatStartState';
import {CombatVictoryState} from './combatVictoryState';


// Combat State Machine
//--------------------------------------------------------------------------
export class CombatStateMachine extends pow2.StateMachine {
  parent:GameStateMachine;
  defaultState:string = CombatStartState.NAME;
  states:pow2.IState[] = [
    new CombatStartState(),
    new CombatVictoryState(),
    new CombatDefeatState(),
    new CombatBeginTurnState(),
    new CombatChooseActionState(),
    new CombatEndTurnState(),
    new CombatEscapeState()
  ];

  party:GameEntityObject[] = [];
  enemies:GameEntityObject[] = [];
  turnList:GameEntityObject[] = [];
  playerChoices:{
    [id:string]:IPlayerAction
  } = {};
  focus:GameEntityObject;
  current:GameEntityObject;
  currentDone:boolean = false;

  isFriendlyTurn():boolean {
    return this.current && !!_.find(this.party, (h:GameEntityObject) => {
          return h._uid === this.current._uid;
        });
  }

  getLiveParty():GameEntityObject[] {
    return _.reject(this.party, (obj:GameEntityObject) => {
      return obj.isDefeated();
    });
  }

  getLiveEnemies():GameEntityObject[] {
    return _.reject(this.enemies, (obj:GameEntityObject) => {
      return obj.isDefeated();
    });
  }

  getRandomPartyMember():GameEntityObject {
    var players = <GameEntityObject[]>_.shuffle(this.party);
    while (players.length > 0) {
      var p = players.shift();
      if (!p.isDefeated()) {
        return p;
      }
    }
    return null;
  }

  getRandomEnemy():GameEntityObject {
    var players = <GameEntityObject[]>_.shuffle(this.enemies);
    while (players.length > 0) {
      var p = players.shift();
      if (!p.isDefeated()) {
        return p;
      }
    }
    return null;
  }

  partyDefeated():boolean {
    var deadList = _.reject(this.party, (obj:GameEntityObject) => {
      return obj.model.attributes.hp <= 0;
    });
    return deadList.length === 0;
  }

  enemiesDefeated():boolean {
    return _.reject(this.enemies, (obj:GameEntityObject) => {
          return obj.model.attributes.hp <= 0;
        }).length === 0;
  }

  constructor(parent:GameStateMachine) {
    super();
    this.parent = parent;
  }
}
