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
import {GameWorld} from '../../../services/game-world';
import {StateMachine} from '../../../../game/pow2/core/state-machine';
import {IState} from '../../../../game/pow2/core/state';
import {CombatStartStateComponent} from './combat-start.state';
import {Component, AfterViewInit, ViewChildren, QueryList, Input} from '@angular/core';
import {CombatEncounter} from '../../../models/combat/combat.model';
import {CombatMachineState} from './combat-base.state';
import {Scene} from '../../../../game/pow2/scene/scene';
import {CombatPlayerComponent} from '../combat-player.entity';
import {CombatEnemyComponent} from '../combat-enemy.entity';
import {GameEntityObject} from '../../../scene/game-entity-object';
import {TileMapView} from '../../../../game/pow2/tile/tile-map-view';
import {CombatService} from '../../../models/combat/combat.service';

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

// Combat State Machine

@Component({
  selector: 'combat-state-machine',
  template: `
    <combat-start-state #start></combat-start-state>
    <combat-begin-turn-state #beginTurn></combat-begin-turn-state>
    <combat-choose-action-state
      [pointAt]="current"
      #chooseAction></combat-choose-action-state>
    <combat-end-turn-state #endTurn></combat-end-turn-state>
    <combat-defeat-state #defeat></combat-defeat-state>
    <combat-victory-state #victory></combat-victory-state>
    <combat-escape-state #escape></combat-escape-state>
  `
})
export class CombatStateMachineComponent extends StateMachine implements AfterViewInit {
  defaultState: string = CombatStartStateComponent.NAME;
  world: GameWorld;
  states: IState[] = [];
  turnList: GameEntityObject[] = [];
  playerChoices: {
    [id: string]: IPlayerAction
  } = {};
  focus: GameEntityObject;
  current: GameEntityObject;
  currentDone: boolean = false;

  constructor(private combatService: CombatService) {
    super();
  }

  @Input() scene: Scene;
  @Input() encounter: CombatEncounter;
  @Input() party: QueryList<CombatPlayerComponent>;
  @Input() enemies: QueryList<CombatEnemyComponent>;

  @Input() view: TileMapView;

  @ViewChildren('start,beginTurn,chooseAction,endTurn,defeat,victory,escape')
  childStates: QueryList<CombatMachineState>;

  ngAfterViewInit(): void {
    this.addStates(this.childStates.toArray());
    this.setCurrentState(this.getState(this.defaultState));
  }

  isFriendlyTurn(): boolean {
    return !!(this.current && this.party.find((member) => member._uid === this.current._uid));
  }

  getLiveParty(): CombatPlayerComponent[] {
    return this.party.filter((obj: CombatPlayerComponent) => {
      return !this.combatService.isDefeated(obj.model);
    });
  }

  getLiveEnemies(): CombatEnemyComponent[] {
    return this.enemies.filter((obj: CombatEnemyComponent) => {
      return !this.combatService.isDefeated(obj.model);
    });
  }

  getRandomPartyMember(): GameEntityObject {
    const players = <CombatPlayerComponent[]> _.shuffle(this.party.toArray());
    while (players.length > 0) {
      const p = players.shift();
      if (!this.combatService.isDefeated(p.model)) {
        return p;
      }
    }
    return null;
  }

  getRandomEnemy(): GameEntityObject {
    const players = <CombatEnemyComponent[]> _.shuffle(this.enemies.toArray());
    while (players.length > 0) {
      const p = players.shift();
      if (!this.combatService.isDefeated(p.model)) {
        return p;
      }
    }
    return null;
  }

  partyDefeated(): boolean {
    return this.getLiveParty().length === 0;
  }

  enemiesDefeated(): boolean {
    return this.getLiveEnemies().length === 0;
  }

}
