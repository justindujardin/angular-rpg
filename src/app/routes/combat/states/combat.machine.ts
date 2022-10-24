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
import { IState } from '../../../../game/pow2/core/state';
import { StateMachine } from '../../../../game/pow2/core/state-machine';
import { Scene } from '../../../../game/pow2/scene/scene';
import { AppState } from '../../../app.model';
import { CombatEncounter } from '../../../models/combat/combat.model';
import { CombatService } from '../../../models/combat/combat.service';
import { EntityItemTypes } from '../../../models/entity/entity.reducer';
import {
  ITemplateArmor,
  ITemplateMagic,
  ITemplateWeapon,
} from '../../../models/game-data/game-data.model';
import { Item } from '../../../models/item';
import { getGameInventory } from '../../../models/selectors';
import { GameEntityObject } from '../../../scene/game-entity-object';
import { TileMapView } from '../../../scene/tile-map-view';
import { GameWorld } from '../../../services/game-world';
import { CombatEnemyComponent } from '../combat-enemy.entity';
import { CombatPlayerComponent } from '../combat-player.entity';
import { CombatMachineState } from './combat-base.state';
import { CombatStateNames } from './states';

/**
 * Completion callback for a player action.
 */
export type IPlayerActionCallback = (action: IPlayerAction, error?: any) => void;
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
      #chooseAction
    ></combat-choose-action-state>
    <combat-end-turn-state #endTurn></combat-end-turn-state>
    <combat-defeat-state #defeat></combat-defeat-state>
    <combat-victory-state #victory></combat-victory-state>
    <combat-escape-state #escape></combat-escape-state>
  `,
})
export class CombatStateMachineComponent
  extends StateMachine<CombatStateNames>
  implements AfterViewInit
{
  /** The items available to the party */
  public get items(): Immutable.List<Item> {
    return this._items$.value;
  }
  /** The items available to the party */
  public get armors(): Immutable.List<ITemplateArmor> {
    return this._armors$.value;
  }
  /** The items available to the party */
  public get weapons(): Immutable.List<ITemplateWeapon> {
    return this._weapons$.value;
  }
  /** The items available to the party */
  public get spells(): Immutable.List<ITemplateMagic> {
    return this._spells$.value;
  }

  constructor(private combatService: CombatService, public store: Store<AppState>) {
    super();
  }
  defaultState: CombatStateNames = 'start';
  world: GameWorld;
  states: IState<CombatStateNames>[] = [];
  turnList: GameEntityObject[] = [];
  playerChoices: {
    [id: string]: IPlayerAction;
  } = {};
  focus: GameEntityObject;
  current: GameEntityObject;
  currentDone: boolean = false;

  // Use this private behavior subject to make the value sync accessible for canBeUsedBy (x_X)
  private _items$ = new BehaviorSubject<Immutable.List<Item>>(Immutable.List([]));
  private _armors$ = new BehaviorSubject<Immutable.List<ITemplateArmor>>(
    Immutable.List([])
  );
  private _weapons$ = new BehaviorSubject<Immutable.List<ITemplateWeapon>>(
    Immutable.List([])
  );
  private _spells$ = new BehaviorSubject<Immutable.List<ITemplateMagic>>(
    Immutable.List([])
  );

  private _subscription?: Subscription;

  @Input() scene: Scene;
  @Input() encounter: CombatEncounter;
  @Input() party: QueryList<CombatPlayerComponent>;
  @Input() enemies: QueryList<CombatEnemyComponent>;

  @Input() view: TileMapView;

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
          const items = inventory.filter((i: Item) => i.type === 'item').toList();
          const weapons = inventory
            .filter((i: ITemplateWeapon) => i.type === 'weapon')
            .toList();
          const armors = inventory
            .filter(
              (i: ITemplateArmor) =>
                ['helm', 'boots', 'shield', 'armor'].indexOf(i.type) !== -1
            )
            .toList();
          const spells = inventory
            .filter((i: ITemplateMagic) => i.type === 'spell')
            .toList();
          return { items, weapons, armors, spells };
        })
      )
      .subscribe((values) => {
        const { items, weapons, armors, spells } = values;
        this._items$.next(items as Immutable.List<Item>);
        this._weapons$.next(weapons as Immutable.List<ITemplateWeapon>);
        this._armors$.next(armors as Immutable.List<ITemplateArmor>);
        this._spells$.next(spells as Immutable.List<ITemplateMagic>);
      });
    this.addStates(this.childStates.toArray());
    this.setCurrentStateObject(this.getState(this.defaultState));
  }

  isFriendlyTurn(): boolean {
    return !!(
      this.current && this.party.find((member) => member._uid === this.current._uid)
    );
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
    const players = _.shuffle(this.party.toArray()) as CombatPlayerComponent[];
    while (players.length > 0) {
      const p = players.shift();
      if (!this.combatService.isDefeated(p.model)) {
        return p;
      }
    }
    return null;
  }

  getRandomEnemy(): GameEntityObject {
    const players = _.shuffle(this.enemies.toArray()) as CombatEnemyComponent[];
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
