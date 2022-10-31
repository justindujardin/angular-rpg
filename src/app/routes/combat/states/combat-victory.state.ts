import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { getArmorById } from 'app/models/game-data/armors';
import { getItemById } from 'app/models/game-data/items';
import { getWeaponById } from 'app/models/game-data/weapons';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { IEnemy, IPartyMember } from '../../../../app/models/base-entity';
import { CombatService } from '../../../../app/models/combat/combat.service';
import {
  awardExperience,
  diffPartyMember,
  IPartyStatsDiff,
} from '../../../../app/models/mechanics';
import { AppState } from '../../../app.model';
import {
  CombatVictoryAction,
  CombatVictorySummary,
} from '../../../models/combat/combat.actions';
import { CombatState } from '../../../models/combat/combat.model';
import {
  instantiateEntity,
  ITemplateBaseItem,
} from '../../../models/game-data/game-data.model';
import {
  GameStateAddGoldAction,
  GameStateAddInventoryAction,
} from '../../../models/game-state/game-state.actions';
import { Item } from '../../../models/item';
import { sliceCombatState } from '../../../models/selectors';
import { assertTrue } from '../../../models/util';
import { CombatMachineState } from './combat-base.state';
import { CombatStateMachineComponent } from './combat.machine';
import { CombatStateNames } from './states';

@Component({
  selector: 'combat-victory-state',
  template: ` <ng-content></ng-content>`,
})
export class CombatVictoryStateComponent extends CombatMachineState {
  static NAME: CombatStateNames = 'victory';
  name: CombatStateNames = CombatVictoryStateComponent.NAME;

  constructor(public store: Store<AppState>, public combatService: CombatService) {
    super();
  }

  enter(machine: CombatStateMachineComponent) {
    super.enter(machine);

    combineLatest(
      [this.store.select(sliceCombatState).pipe(take(1))],
      (state: CombatState) => {
        let players: IPartyMember[] = state.party.toArray();
        let enemies: IEnemy[] = state.enemies.toArray();
        assertTrue(players.length > 0, 'no living players during combat victory state');
        let gold: number = 0;
        let exp: number = 0;
        let itemTemplateIds: string[] = [];

        // Sum experience and gold for each enemy that was defeated
        state.enemies.forEach((combatant: IEnemy) => {
          gold += combatant.gold || 0;
          exp += combatant.exp || 0;
        });

        // Apply Fixed encounter bonus awards
        //
        if (state.type === 'fixed') {
          if (state.gold && state.gold > 0) {
            gold += state.gold;
          }
          if (state.experience && state.experience > 0) {
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
          let item: ITemplateBaseItem | null = getWeaponById(itemId);
          if (!item) {
            item = getArmorById(itemId);
          }
          if (!item) {
            item = getItemById(itemId);
          }
          assertTrue(!!item, 'cannot award unknown item ' + itemId);
          const model = instantiateEntity<Item>(item);
          this.store.dispatch(new GameStateAddInventoryAction(model));
        });

        // Award experience
        //
        const expPerParty: number = Math.round(exp / players.length);
        const levelUps: IPartyStatsDiff[] = [];
        players = players.map((player: IPartyMember) => {
          let result = awardExperience(expPerParty, player);
          if (result.level > player.level) {
            levelUps.push(diffPartyMember(player, result));
          }
          return result;
        });

        // Dispatch victory action
        assertTrue(machine.encounter, 'invalid combat encounter');
        const summary: CombatVictorySummary = {
          type: machine.encounter.type,
          id: machine.encounter.id || '',
          party: players,
          enemies,
          levels: levelUps,
          items: itemInstances,
          gold,
          exp,
        };
        this.store.dispatch(new CombatVictoryAction(summary));
      }
    ).subscribe();
  }
}
