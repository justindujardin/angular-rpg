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
import {CombatStartState} from './combat-start.state';
import {Being} from '../../../models/being';
import {Component, AfterViewInit, ViewChildren, QueryList, Input} from '@angular/core';
import {CombatEncounter} from '../../../models/combat/combat.model';
import {CombatMachineState} from './combat-base.state';
import {Scene} from '../../../../game/pow2/scene/scene';
import {isDefeated} from '../../../models/combat/combat.api';
import {CombatPlayer} from '../combat-player.entity';
import {CombatEnemy} from '../combat-enemy.entity';
import {GameEntityObject} from '../../../../game/rpg/objects/gameEntityObject';
import {TileMapView} from '../../../../game/pow2/tile/tileMapView';


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


// Combat State Machine
//--------------------------------------------------------------------------

@Component({
  selector: 'combat-state-machine',
  template: `
  <combat-start-state #start></combat-start-state>
  <combat-begin-turn-state #beginTurn></combat-begin-turn-state>
  <combat-choose-action-state #chooseAction></combat-choose-action-state>
  <combat-end-turn-state #endTurn></combat-end-turn-state>
  <combat-defeat-state #defeat></combat-defeat-state>
  <combat-victory-state #victory></combat-victory-state>
  <combat-escape-state #escape></combat-escape-state>
`
})
export class CombatStateMachine extends StateMachine implements AfterViewInit {
  defaultState: string = CombatStartState.NAME;
  world: GameWorld;
  states: IState[] = [];
  turnList: GameEntityObject[] = [];
  playerChoices: {
    [id: string]: IPlayerAction
  } = {};
  focus: GameEntityObject;
  current: GameEntityObject;
  currentDone: boolean = false;

  @Input() scene: Scene;
  @Input() encounter: CombatEncounter;
  @Input() party: CombatPlayer[] = [];
  @Input() enemies: CombatEnemy[] = [];

  @Input() view: TileMapView;

  @ViewChildren('start,beginTurn,chooseAction,endTurn,defeat,victory,escape') childStates: QueryList<CombatMachineState>;

  ngAfterViewInit(): void {
    this.addStates(this.childStates.toArray());
    this.setCurrentState(this.getState(this.defaultState));
  }

  isFriendlyTurn(): boolean {
    return this.current && !!_.find(this.party, (h: Being) => {
        console.warn('friendly compare logic is busted');
        // return h.id === this.current.id;
        return true;
      });
  }

  getLiveParty(): CombatPlayer[] {
    return _.reject(this.party, (obj: CombatPlayer) => {
      return isDefeated(obj.model);
    });
  }

  getLiveEnemies(): CombatEnemy[] {
    return _.reject(this.enemies, (obj: CombatEnemy) => {
      return isDefeated(obj.model);
    });
  }

  getRandomPartyMember(): Being {
    const players = <CombatPlayer[]>_.shuffle(this.party);
    while (players.length > 0) {
      const p = players.shift();
      if (!isDefeated(p.model)) {
        return p;
      }
    }
    return null;
  }

  getRandomEnemy(): Being {
    const players = <CombatEnemy[]>_.shuffle(this.enemies);
    while (players.length > 0) {
      const p = players.shift();
      if (!isDefeated(p.model)) {
        return p;
      }
    }
    return null;
  }

  partyDefeated(): boolean {
    const deadList = _.reject(this.party, (obj: CombatPlayer) => {
      return isDefeated(obj.model);
    });
    return deadList.length === 0;
  }

  enemiesDefeated(): boolean {
    return _.reject(this.enemies, (obj: CombatEnemy) => {
        return isDefeated(obj.model);
      }).length === 0;
  }

}
