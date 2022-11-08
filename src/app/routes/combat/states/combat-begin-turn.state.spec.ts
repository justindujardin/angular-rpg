import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../../app.imports';
import { APP_TESTING_PROVIDERS, testAppLoadSprites } from '../../../app.testing';
import { assertTrue } from '../../../models/util';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import { CombatAttackBehaviorComponent } from '../behaviors/actions';
import {
  testCombatAddEnemyCombatants,
  testCombatAddPartyCombatants,
  testCombatGetEncounter,
  testCombatGetStateMachine,
} from '../combat.testing';
import { CombatBeginTurnStateComponent } from './combat-begin-turn.state';

describe('CombatBeginTurnStateComponent', () => {
  let world: GameWorld;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [CombatBeginTurnStateComponent],
      providers: APP_TESTING_PROVIDERS,
    }).compileComponents();
    world = TestBed.inject(GameWorld);
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
    await testAppLoadSprites();
  });

  it('calls act() on current party member action choice', async () => {
    const fixture = TestBed.createComponent(CombatBeginTurnStateComponent);
    const comp = fixture.componentInstance;
    const machine = testCombatGetStateMachine();
    const players = testCombatAddPartyCombatants(machine.store, machine);
    const enemies = await testCombatAddEnemyCombatants(machine);
    machine.current = players[0];
    let called = false;
    machine.playerChoices[machine.current._uid] = {
      from: players[0],
      to: enemies[0],
      name: 'attack',
      act: async () => {
        called = true;
        return true;
      },
    };
    machine.encounter = testCombatGetEncounter(machine.store);
    await comp.enter(machine);
    fixture.detectChanges();
    expect(called).toBe(true);
  });

  it('selects a new target is player target dies before their turn', async () => {
    const fixture = TestBed.createComponent(CombatBeginTurnStateComponent);
    const comp = fixture.componentInstance;
    const machine = testCombatGetStateMachine();
    const players = testCombatAddPartyCombatants(machine.store, machine);
    const enemies = await testCombatAddEnemyCombatants(machine);
    const deadEnemy = enemies[1];
    assertTrue(deadEnemy.model, 'missing second enemy');
    deadEnemy.model = { ...deadEnemy.model, hp: 0 };
    machine.current = players[0];
    let called = false;

    const choice = (machine.playerChoices[machine.current._uid] = {
      from: players[0],
      to: deadEnemy,
      name: 'attack',
      act: async () => {
        expect(choice.from).toEqual(players[0]);
        // Chose a different enemy
        expect(choice.to._uid).not.toEqual(deadEnemy._uid);
        expect(choice.to.model?.hp).toBeGreaterThan(0);
        called = true;
        return true;
      },
    });
    machine.encounter = testCombatGetEncounter(machine.store);
    await comp.enter(machine);
    fixture.detectChanges();
    expect(called).toBe(true);
  });

  it('scales current player up on enter and back down on exit', async () => {
    const fixture = TestBed.createComponent(CombatBeginTurnStateComponent);
    const comp = fixture.componentInstance;
    const machine = testCombatGetStateMachine();
    const players = testCombatAddPartyCombatants(machine.store, machine);
    const enemies = await testCombatAddEnemyCombatants(machine);
    machine.playerChoices[players[0]._uid] = {
      from: players[0],
      to: enemies[0],
      name: 'attack',
      act: async () => true,
    };
    machine.current = players[0];
    machine.encounter = testCombatGetEncounter(machine.store);
    await comp.enter(machine);
    expect(players[0].scale).toBe(1.25);
    fixture.detectChanges();
    comp.exit(machine);
    expect(players[0].scale).toBe(1);
  });

  it('enemies choose random party members to attack', async () => {
    const fixture = TestBed.createComponent(CombatBeginTurnStateComponent);
    const comp = fixture.componentInstance;
    await testAppLoadSprites();
    const machine = testCombatGetStateMachine();
    const player = testCombatAddPartyCombatants(machine.store, machine, true)[0];
    const enemies = await testCombatAddEnemyCombatants(machine);
    const enemy = enemies[0];
    const attackComponent = enemy.findBehavior<CombatAttackBehaviorComponent>(
      CombatAttackBehaviorComponent
    );
    assertTrue(attackComponent, 'enemy has no attack component');
    let called = false;
    attackComponent.act = async function () {
      // Enemy is the attcker
      expect(attackComponent.from).toEqual(enemy);
      // Player is the defender
      expect(attackComponent.to).toEqual(player);
      called = true;
      return true;
    };
    machine.current = enemy;

    await comp.enter(machine);
    fixture.detectChanges();

    expect(called).toBe(true);
  });
});
