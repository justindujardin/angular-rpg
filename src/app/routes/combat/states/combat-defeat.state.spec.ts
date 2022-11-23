import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { take } from 'rxjs/operators';
import { APP_IMPORTS } from '../../../app.imports';
import { APP_TESTING_PROVIDERS } from '../../../app.testing';
import { testCombatGetStateMachine } from '../combat.testing';
import { CombatDefeatStateComponent } from './combat-defeat.state';

describe('CombatDefeatStateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [CombatDefeatStateComponent],
      providers: APP_TESTING_PROVIDERS,
    }).compileComponents();
  });

  describe('enter', () => {
    it('emits onDefeat$ then reloads the page to reset game', async () => {
      const fixture = TestBed.createComponent(CombatDefeatStateComponent);
      const comp = fixture.componentInstance;
      const machine = testCombatGetStateMachine();
      let called = false;
      comp.resetGame = () => (called = true);
      const defeatPromise = machine.onDefeat$.pipe(take(1)).toPromise();
      await comp.enter(machine);
      await defeatPromise;
      expect(called).toBe(true);
    });
  });
});
