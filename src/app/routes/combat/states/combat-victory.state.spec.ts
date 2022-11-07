import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../../app.imports';
import {
  APP_TESTING_PROVIDERS,
  testAppGetInventory,
  testAppGetParty,
  testAppGetPartyGold,
} from '../../../app.testing';
import { CombatVictoryAction } from '../../../models/combat/combat.actions';
import { ENEMIES_DATA } from '../../../models/game-data/enemies';
import {
  ITemplateEnemy,
  ITemplateFixedEncounter,
  ITemplateRandomEncounter,
} from '../../../models/game-data/game-data.model';
import { RANDOM_ENCOUNTERS_DATA } from '../../../models/game-data/random-encounters';
import { GameStateAddGoldAction } from '../../../models/game-state/game-state.actions';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import {
  testCombatGetEncounter,
  testCombatGetStateMachine,
  testCombatSetFixedEncounter,
  testCombatSetRandomEncounter,
} from '../combat.testing';
import { CombatVictoryStateComponent } from './combat-victory.state';

describe('CombatVictoryStateComponent', () => {
  let world: GameWorld;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [CombatVictoryStateComponent],
      providers: APP_TESTING_PROVIDERS,
    }).compileComponents();
    world = TestBed.inject(GameWorld);
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
  });

  it('dispatches a victory action with combat summary', async () => {
    const fixture = TestBed.createComponent(CombatVictoryStateComponent);
    const comp = fixture.componentInstance;
    const machine = testCombatGetStateMachine();
    const party = testAppGetParty(comp.store);
    testCombatSetRandomEncounter(comp.store, party, RANDOM_ENCOUNTERS_DATA[0]);
    machine.encounter = testCombatGetEncounter(comp.store);
    spyOn(machine.store, 'dispatch');
    comp.enter(machine);
    fixture.detectChanges();
    expect(machine.store.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: CombatVictoryAction.typeId,
      })
    );
  });

  it('awards gold equal to the sum of enemy gold values', async () => {
    const fixture = TestBed.createComponent(CombatVictoryStateComponent);
    const comp = fixture.componentInstance;
    const machine = testCombatGetStateMachine();
    const party = testAppGetParty(comp.store);
    const enemy: ITemplateEnemy = ENEMIES_DATA[0];
    const encounter: ITemplateRandomEncounter = {
      id: 'test',
      zones: ['test-zone'],
      enemies: [enemy.id, enemy.id],
    };
    testCombatSetRandomEncounter(comp.store, party, encounter);
    machine.encounter = testCombatGetEncounter(comp.store);
    spyOn(machine.store, 'dispatch');
    comp.enter(machine);
    fixture.detectChanges();
    expect(machine.store.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: GameStateAddGoldAction.typeId,
        payload: enemy.gold * 2,
      })
    );
  });
  it('awards items/gold from fixed encounters', async () => {
    const fixture = TestBed.createComponent(CombatVictoryStateComponent);
    const comp = fixture.componentInstance;
    const machine = testCombatGetStateMachine();
    const beforeGold = testAppGetPartyGold(comp.store);
    const party = testAppGetParty(comp.store);
    const enemy: ITemplateEnemy = ENEMIES_DATA[0];
    const encounter: ITemplateFixedEncounter = {
      id: 'test',
      enemies: [enemy.id, enemy.id],
      experience: 2000,
      gold: 1000,
      items: ['club', 'leather-armor', 'potion'],
    };
    testCombatSetFixedEncounter(comp.store, party, encounter);
    machine.encounter = testCombatGetEncounter(comp.store);
    comp.enter(machine);
    fixture.detectChanges();
    const gold = testAppGetPartyGold(comp.store);
    expect(gold).toBe(beforeGold + enemy.gold * 2 + encounter.gold);

    const inventory = testAppGetInventory(comp.store);
    expect(inventory.length).toBe(3);
    expect(inventory[0].id).toBe('club');
    expect(inventory[1].id).toBe('leather-armor');
    expect(inventory[2].id).toBe('potion');
  });
});
