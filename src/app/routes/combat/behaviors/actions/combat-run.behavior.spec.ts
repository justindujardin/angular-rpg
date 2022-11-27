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
import { testCombatCreateComponentFixture } from '../../combat.testing';
import { CombatRunBehaviorComponent } from './combat-run.behavior';

describe('CombatRunBehaviorComponent', () => {
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
  it('cannot target players', async () => {
    const { combat } = testCombatCreateComponentFixture();
    const fixture = TestBed.createComponent(CombatRunBehaviorComponent);
    const comp = fixture.componentInstance;
    comp.combat = combat;
    expect(comp.canTarget()).toBe(false);
  });
  describe('act', () => {
    it('rejects with invalid current player', async () => {
      const { combat, machine } = testCombatCreateComponentFixture();
      const fixture = TestBed.createComponent(CombatRunBehaviorComponent);
      const comp = fixture.componentInstance;
      comp.combat = combat;
      await expectAsync(comp.act()).toBeRejected();
    });
    it('transitions to end-turn state when run fails', async () => {
      const { combat, machine } = testCombatCreateComponentFixture();
      const fixture = TestBed.createComponent(CombatRunBehaviorComponent);
      const comp = fixture.componentInstance;
      const players = combat.party.toArray();
      spyOn(machine, 'setCurrentState');
      machine.current = players[0];
      comp.combat = combat;
      spyOn(comp, 'rollEscape').and.callFake(() => false);
      await expectAsync(comp.act()).toBeResolved();
      fixture.detectChanges();
      expect(machine.setCurrentState).toHaveBeenCalledOnceWith('end-turn');
    });
    it('transitions to escape state when run fails', async () => {
      const { combat, machine } = testCombatCreateComponentFixture();
      const fixture = TestBed.createComponent(CombatRunBehaviorComponent);
      const comp = fixture.componentInstance;
      const players = combat.party.toArray();
      spyOn(machine, 'setCurrentState');
      machine.current = players[0];
      comp.combat = combat;
      spyOn(comp, 'rollEscape').and.callFake(() => true);
      await expectAsync(comp.act()).toBeResolved();
      fixture.detectChanges();
      expect(machine.setCurrentState).toHaveBeenCalledOnceWith('escape');
    });
  });
});
