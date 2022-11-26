import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../../../app.imports';
import {
  APP_TESTING_PROVIDERS,
  testAppLoadSprites,
  testAppMockNotificationService,
} from '../../../../app.testing';
import { GameWorld } from '../../../../services/game-world';
import { RPGGame } from '../../../../services/rpg-game';
import {
  testCombatCreateComponentFixture,
  testCombatGetParty,
} from '../../combat.testing';
import { CombatGuardBehavior } from './combat-guard.behavior';

describe('CombatGuardBehavior', () => {
  let world: GameWorld;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      providers: [...APP_TESTING_PROVIDERS, testAppMockNotificationService()],
    }).compileComponents();
    await testAppLoadSprites();
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
    world = TestBed.inject(GameWorld);
    world.time.start();
  });
  afterEach(() => {
    world.time.stop();
  });
  it('cannot specify a target', async () => {
    const { combat } = testCombatCreateComponentFixture();
    const fixture = TestBed.createComponent(CombatGuardBehavior);
    const comp = fixture.componentInstance;
    comp.combat = combat;
    expect(comp.canTarget()).toBe(false);
  });
  describe('act', () => {
    it('rejects with invalid from player', async () => {
      const { combat, machine } = testCombatCreateComponentFixture();
      const fixture = TestBed.createComponent(CombatGuardBehavior);
      const comp = fixture.componentInstance;
      comp.combat = combat;
      comp.from = null;
      await expectAsync(comp.act()).toBeRejected();
    });
    it('transitions to end-turn state', async () => {
      const { combat, machine } = testCombatCreateComponentFixture();
      const fixture = TestBed.createComponent(CombatGuardBehavior);
      const comp = fixture.componentInstance;
      const players = combat.party.toArray();
      spyOn(machine, 'setCurrentState');
      comp.combat = combat;
      comp.from = players[0];
      await expectAsync(comp.act()).toBeResolved();
      expect(machine.setCurrentState).toHaveBeenCalledOnceWith('end-turn');
    });
    it('sets "guarding" status on player until a target state is entered', async () => {
      const { combat, machine } = testCombatCreateComponentFixture();
      const fixture = TestBed.createComponent(CombatGuardBehavior);
      const comp = fixture.componentInstance;
      const players = combat.party.toArray();
      spyOn(machine, 'setCurrentState').and.callThrough();
      comp.combat = combat;
      comp.from = players[0];
      await expectAsync(comp.act()).toBeResolved();

      // "guarding" status is added to player
      const guardingPlayer = testCombatGetParty(comp.store).get(0);
      expect(guardingPlayer.status).toEqual(['guarding']);

      // Clears guarding when choosing new actions next turn
      await comp.combat.machine.setCurrentState('choose-action');
      fixture.detectChanges();

      const finalPlayer = testCombatGetParty(comp.store).get(0);
      expect(finalPlayer.status).toEqual([]);
    });
  });
});
