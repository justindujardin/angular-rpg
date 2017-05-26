import {CombatMachineState} from './combat-base.state';
import {HeroModel} from '../../../../game/rpg/models/heroModel';
import {ItemModel} from '../../../../game/rpg/models/itemModel';
import {CombatStateMachineComponent} from './combat.machine';
import {Component} from '@angular/core';
import {Entity} from '../../../models/entity/entity.model';
import {Item} from '../../../models/item';
import {Combatant, CombatState} from '../../../models/combat/combat.model';
import {AppState} from '../../../app.model';
import {Store} from '@ngrx/store';
import {getGameDataArmors, getGameDataItems, getGameDataWeapons, sliceCombatState} from '../../../models/selectors';
import {assertTrue} from '../../../models/util';
import {GameStateAddGoldAction, GameStateAddInventoryAction} from '../../../models/game-state/game-state.actions';
import {instantiateEntity, ITemplateBaseItem} from '../../../models/game-data/game-data.model';
import {Observable} from 'rxjs/Observable';
import {
  getAgilityForLevel,
  getHPForLevel,
  getIntelligenceForLevel,
  getStrengthForLevel,
  getVitalityForLevel,
  getXPForLevel
} from '../../../models/levels';
import {CombatVictoryAction, CombatVictorySummary} from '../../../models/combat/combat.actions';
import * as Immutable from 'immutable';

@Component({
  selector: 'combat-victory-state',
  template: `
    <ng-content></ng-content>`
})
export class CombatVictoryStateComponent extends CombatMachineState {
  static NAME: string = 'Combat Victory';
  name: string = CombatVictoryStateComponent.NAME;
  /**
   * Item templates to instantiate any combat victory reward items
   */
  private items$: Observable<Immutable.List<ITemplateBaseItem>> = this.store.select(getGameDataWeapons)
    .combineLatest(
      this.store.select(getGameDataArmors),
      this.store.select(getGameDataItems),
      (weapons, armors, items) => {
        return items.concat(weapons).concat(armors);
      });

  constructor(public store: Store<AppState>) {
    super();
  }

  awardExperience(exp: number, model: Entity): Entity {
    const newExp: number = model.exp + exp;
    let result: Entity = {
      ...model,
      exp: newExp
    };
    const nextLevel: number = getXPForLevel(model.level + 1);
    if (newExp >= nextLevel) {
      result = this.awardLevelUp(model);
    }
    return result;
  }

  awardLevelUp(model: Entity): Entity {
    const nextLevel: number = model.level + 1;
    const newHP = getHPForLevel(nextLevel, model);
    return {
      ...model,
      level: nextLevel,
      maxhp: newHP,
      hp: newHP,
      attack: getStrengthForLevel(nextLevel, model),
      speed: getAgilityForLevel(nextLevel, model),
      defense: getVitalityForLevel(nextLevel, model),
      magic: getIntelligenceForLevel(nextLevel, model)
    };
  }

  enter(machine: CombatStateMachineComponent) {
    super.enter(machine);

    this.store.select(sliceCombatState)
      .take(1)
      .combineLatest(this.items$, (state: CombatState, items: ITemplateBaseItem[]) => {
        let players: Entity[] = state.party.toArray();
        let enemies: Combatant[] = state.enemies.toArray();
        assertTrue(players.length > 0, 'no living players during combat victory state');
        let gold: number = 0;
        let exp: number = 0;
        let itemTemplateIds: string[] = [];

        // Sum experience and gold for each enemy that was defeated
        state.enemies.forEach((combatant: Combatant) => {
          gold += combatant.gold || 0;
          exp += combatant.exp || 0;
        });

        // Apply Fixed encounter bonus awards
        //
        if (state.type === 'fixed') {
          if (state.gold > 0) {
            gold += state.gold;
          }
          if (state.experience > 0) {
            exp += state.experience;
          }
          if (state.items && state.items.length > 0) {
            itemTemplateIds = itemTemplateIds.concat(state.items);
          }
        }

        // Award gold
        //
        this.store.dispatch(new GameStateAddGoldAction(gold));

        // Award items
        //
        const itemInstances: Item[] = [];
        itemTemplateIds.forEach((itemId: string) => {
          const item: ITemplateBaseItem = items.find((i: ITemplateBaseItem) => i.id === itemId);
          assertTrue(!!item, 'cannot award unknown item ' + itemId);
          const model = instantiateEntity<Item>(item);
          this.store.dispatch(new GameStateAddInventoryAction(model));
        });

        // Award experience
        //
        const expPerParty: number = Math.round(exp / players.length);
        const levelUps: Entity[] = [];
        players = players.map((player: Entity) => {
          let result = this.awardExperience(expPerParty, player);
          if (result.level > player.level) {
            levelUps.push(result);
          }
          return result;
        });

        // Dispatch victory action
        const summary: CombatVictorySummary = {
          type: machine.encounter.type,
          id: machine.encounter.id,
          party: players,
          enemies,
          levels: levelUps,
          items: itemInstances,
          gold,
          exp
        };
        this.store.dispatch(new CombatVictoryAction(summary));
      }).subscribe();
  }
}
