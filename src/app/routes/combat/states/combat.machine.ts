/*
 Copyright (C) 2013-2020 by Justin DuJardin and Contributors

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
import {
  AfterViewInit,
  Component,
  Input,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Store } from '@ngrx/store';
import * as Immutable from 'immutable';
import { BehaviorSubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'underscore';
import { AppState } from '../../../app.model';
import { StateAsyncEmitter, StateMachine } from '../../../core/state-machine';
import { CombatVictorySummary } from '../../../models/combat/combat.actions';
import { CombatEncounter } from '../../../models/combat/combat.model';
import { CombatService } from '../../../models/combat/combat.service';
import { EntityItemTypes } from '../../../models/entity/entity.reducer';
import { Armor, Item, Magic, Weapon } from '../../../models/item';
import { getGameInventory } from '../../../models/selectors';
import { GameEntityObject } from '../../../scene/objects/game-entity-object';
import { Scene } from '../../../scene/scene';
import { SceneView } from '../../../scene/scene-view';
import { GameWorld } from '../../../services/game-world';
import { CombatEnemyComponent } from '../combat-enemy.component';
import { CombatPlayerComponent } from '../combat-player.component';
import { CombatComponent } from '../combat.component';
import { CombatAttackSummary, CombatSceneClick, IPlayerAction } from '../combat.types';
import { CombatMachineState } from './combat-base.state';
import { CombatDefeatSummary } from './combat-defeat.state';
import { CombatRunSummary } from './combat-escape.state';
import { CombatStateNames } from './states';

// Combat State Machine

@Component({
  selector: 'combat-state-machine',
  templateUrl: './combat.machine.html',
})
export class CombatStateMachineComponent
  extends StateMachine<CombatStateNames>
  implements AfterViewInit
{
  /** Emitted when a new player turn is beginning */
  onBeginTurn$ = new StateAsyncEmitter<GameEntityObject>(this);
  /** Emitted during an attack */
  onAttack$ = new StateAsyncEmitter<CombatAttackSummary>(this);
  /** Emitted when the party attempts to run */
  onRun$ = new StateAsyncEmitter<CombatRunSummary>(this);
  /** Emitted when the party successfully defeats the enemies */
  onVictory$ = new StateAsyncEmitter<CombatVictorySummary>(this);
  /** Emitted when the party is defeated */
  onDefeat$ = new StateAsyncEmitter<CombatDefeatSummary>(this);
  /** Emitted when the user clicks on a scene object in combat */
  onClick$ = new StateAsyncEmitter<CombatSceneClick>(this);

  /** The items available to the party */
  public get items(): Immutable.List<Item> {
    return this._items$.value;
  }
  /** The items available to the party */
  public get armors(): Immutable.List<Armor> {
    return this._armors$.value;
  }
  /** The items available to the party */
  public get weapons(): Immutable.List<Weapon> {
    return this._weapons$.value;
  }
  /** The items available to the party */
  public get spells(): Immutable.List<Magic> {
    return this._spells$.value;
  }

  constructor(private combatService: CombatService, public store: Store<AppState>) {
    super();
  }
  defaultState: CombatStateNames = 'start';
  world: GameWorld;
  turnList: (CombatPlayerComponent | CombatEnemyComponent)[] = [];
  playerChoices: {
    [id: string]: IPlayerAction;
  } = {};
  focus: CombatPlayerComponent | CombatEnemyComponent | null;
  current: CombatPlayerComponent | CombatEnemyComponent | null;
  currentDone: boolean = false;

  // Use this private behavior subject to make the value sync accessible for canBeUsedBy (x_X)
  private _items$ = new BehaviorSubject<Immutable.List<Item>>(Immutable.List([]));
  private _armors$ = new BehaviorSubject<Immutable.List<Armor>>(Immutable.List([]));
  private _weapons$ = new BehaviorSubject<Immutable.List<Weapon>>(Immutable.List([]));
  private _spells$ = new BehaviorSubject<Immutable.List<Magic>>(Immutable.List([]));

  private _subscription?: Subscription;

  @Input() scene: Scene;
  @Input() encounter: CombatEncounter | null;
  @Input() party: QueryList<CombatPlayerComponent> | null = null;
  @Input() enemies: QueryList<CombatEnemyComponent> | null = null;
  @Input() combat: CombatComponent | null = null;
  @Input() view: SceneView;

  @ViewChildren('start,beginTurn,chooseAction,endTurn,defeat,victory,escape')
  childStates: QueryList<CombatMachineState>;
  ngOnDestroy(): void {
    this._subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this._subscription = this.store
      .select(getGameInventory)
      .pipe(
        map((inventory: Immutable.List<EntityItemTypes>) => {
          const items = inventory.filter((i) => i?.type === 'item').toList();
          const weapons = inventory.filter((i) => i?.type === 'weapon').toList();
          const armors = inventory
            .filter((i?) =>
              ['helm', 'boots', 'shield', 'armor'].includes(i?.type || '')
            )
            .toList();
          const spells = inventory.filter((i) => i?.type === 'spell').toList();
          return { items, weapons, armors, spells };
        })
      )
      .subscribe((values) => {
        const { items, weapons, armors, spells } = values;
        this._items$.next(items as Immutable.List<Item>);
        this._weapons$.next(weapons as Immutable.List<Weapon>);
        this._armors$.next(armors as Immutable.List<Armor>);
        this._spells$.next(spells as Immutable.List<Magic>);
      });
    this.addStates(this.childStates.toArray());
    this.setCurrentStateObject(this.getState(this.defaultState));
  }

  isFriendlyTurn(): boolean {
    if (!this.current || !this.party) {
      return false;
    }
    return !!this.party.find((member) => member._uid === this.current?._uid);
  }

  getLiveParty(): CombatPlayerComponent[] {
    if (!this.party) {
      return [];
    }
    return this.party.filter((obj: CombatPlayerComponent) => {
      return !this.combatService.isDefeated(obj.model);
    });
  }

  getLiveEnemies(): CombatEnemyComponent[] {
    if (!this.enemies) {
      return [];
    }
    return this.enemies.filter((obj: CombatEnemyComponent) => {
      return !this.combatService.isDefeated(obj.model);
    });
  }

  getRandomPartyMember(): CombatPlayerComponent | null {
    if (!this.party) {
      return null;
    }
    const players = _.shuffle(this.party.toArray()) as CombatPlayerComponent[];
    while (players.length > 0) {
      const p = players.shift();
      if (!p) {
        break;
      }
      if (!this.combatService.isDefeated(p.model)) {
        return p;
      }
    }
    return null;
  }

  getRandomEnemy(): CombatEnemyComponent | null {
    if (!this.enemies) {
      return null;
    }
    const players = _.shuffle(this.enemies.toArray()) as CombatEnemyComponent[];
    while (players.length > 0) {
      const p = players.shift();
      if (!p?.model) {
        continue;
      }
      if (!this.combatService.isDefeated(p.model)) {
        return p;
      }
    }
    return null;
  }
}
