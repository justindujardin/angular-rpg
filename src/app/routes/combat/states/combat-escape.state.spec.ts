import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../../app.imports';
import { APP_TESTING_PROVIDERS } from '../../../app.testing';
import { CombatEscapeAction } from '../../../models/combat/combat.actions';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import { testCombatGetStateMachine } from '../combat.testing';
import { CombatEscapeStateComponent } from './combat-escape.state';

describe('CombatEscapeStateComponent', () => {
  let world: GameWorld;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [CombatEscapeStateComponent],
      providers: APP_TESTING_PROVIDERS,
    }).compileComponents();
    world = TestBed.inject(GameWorld);
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
  });

  it('dispatches CombatEscapeAction', async () => {
    const fixture = TestBed.createComponent(CombatEscapeStateComponent);
    const comp = fixture.componentInstance;
    const machine = testCombatGetStateMachine();
    spyOn(machine.store, 'dispatch');
    await comp.enter(machine);
    fixture.detectChanges();
    expect(machine.store.dispatch).toHaveBeenCalledOnceWith(new CombatEscapeAction());
  });
});
