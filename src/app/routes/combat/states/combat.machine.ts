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
import * as _ from 'underscore';
import {GameWorld} from '../../../../app/services/gameWorld';
import {StateMachine} from '../../../../game/pow2/core/stateMachine';
import {IState} from '../../../../game/pow2/core/state';
import {GameEntityObject} from '../../../../game/rpg/objects/gameEntityObject';
import {CombatStartState} from './combat-start.state';
import {CombatVictoryState} from './combat-victory.state';
import {CombatDefeatState} from './combat-defeat.state';
import {CombatBeginTurnState} from './combat-begin-turn.state';
import {CombatChooseActionState} from './combat-choose-action.state';
import {CombatEndTurnState} from './combat-end-turn.state';
import {CombatEscapeState} from './combat-escape.state';
import {Being} from '../../../models/being';


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
  from: Being;
  to: Being;
  act(then?: IPlayerActionCallback): boolean;
}
export interface CombatAttackSummary {
  damage: number;
  attacker: Being;
  defender: Being;
}


// Combat State Machine
//--------------------------------------------------------------------------
export class CombatStateMachine extends StateMachine {
  defaultState: string = CombatStartState.NAME;
  world: GameWorld;
  states: IState[] = [
    new CombatStartState(),
    new CombatVictoryState(),
    new CombatDefeatState(),
    new CombatBeginTurnState(),
    new CombatChooseActionState(),
    new CombatEndTurnState(),
    new CombatEscapeState()
  ];

  party: GameEntityObject[] = [];
  enemies: GameEntityObject[] = [];
  turnList: GameEntityObject[] = [];
  playerChoices: {
    [id: string]: IPlayerAction
  } = {};
  focus: GameEntityObject;
  current: GameEntityObject;
  currentDone: boolean = false;

  isFriendlyTurn(): boolean {
    return this.current && !!_.find(this.party, (h: GameEntityObject) => {
        return h._uid === this.current._uid;
      });
  }

  getLiveParty(): GameEntityObject[] {
    return _.reject(this.party, (obj: GameEntityObject) => {
      return obj.isDefeated();
    });
  }

  getLiveEnemies(): GameEntityObject[] {
    return _.reject(this.enemies, (obj: GameEntityObject) => {
      return obj.isDefeated();
    });
  }

  getRandomPartyMember(): GameEntityObject {
    var players = <GameEntityObject[]>_.shuffle(this.party);
    while (players.length > 0) {
      var p = players.shift();
      if (!p.isDefeated()) {
        return p;
      }
    }
    return null;
  }

  getRandomEnemy(): GameEntityObject {
    var players = <GameEntityObject[]>_.shuffle(this.enemies);
    while (players.length > 0) {
      var p = players.shift();
      if (!p.isDefeated()) {
        return p;
      }
    }
    return null;
  }

  partyDefeated(): boolean {
    var deadList = _.reject(this.party, (obj: GameEntityObject) => {
      return obj.model.hp <= 0;
    });
    return deadList.length === 0;
  }

  enemiesDefeated(): boolean {
    return _.reject(this.enemies, (obj: GameEntityObject) => {
        return obj.model.hp <= 0;
      }).length === 0;
  }

}
