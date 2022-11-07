import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../../app.imports';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import { WindowService } from '../../../services/window';
import {
  testCombatAddEnemyCombatants,
  testCombatAddPartyCombatants,
  testCombatGetStateMachine,
} from '../combat.testing';
import { CombatEndTurnStateComponent } from './combat-end-turn.state';

describe('CombatEndTurnStateComponent', () => {
  let world: GameWorld;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [CombatEndTurnStateComponent],
      providers: [
        {
          provide: WindowService,
          useValue: {
            reload: jasmine.createSpy('reload'),
          },
        },
      ],
    }).compileComponents();
    world = TestBed.inject(GameWorld);
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
  });

  it('transitions to defeat if no live party members', async () => {
    const fixture = TestBed.createComponent(CombatEndTurnStateComponent);
    const comp = fixture.componentInstance;
    const machine = testCombatGetStateMachine();
    spyOn(machine, 'setCurrentState');
    comp.enter(machine);
    fixture.detectChanges();
    expect(machine.setCurrentState).toHaveBeenCalledOnceWith('defeat');
  });
  it('transitions to victory if no live enemies', async () => {
    const fixture = TestBed.createComponent(CombatEndTurnStateComponent);
    const comp = fixture.componentInstance;
    const machine = testCombatGetStateMachine();
    testCombatAddPartyCombatants(machine.store, machine);
    spyOn(machine, 'setCurrentState');
    comp.enter(machine);
    fixture.detectChanges();
    expect(machine.setCurrentState).toHaveBeenCalledOnceWith('victory');
  });
  it('transitions to choose-action if living enemies and party', async () => {
    const fixture = TestBed.createComponent(CombatEndTurnStateComponent);
    const comp = fixture.componentInstance;
    const machine = testCombatGetStateMachine();
    testCombatAddPartyCombatants(machine.store, machine);
    testCombatAddEnemyCombatants(machine);
    spyOn(machine, 'setCurrentState');
    comp.enter(machine);
    fixture.detectChanges();
    expect(machine.setCurrentState).toHaveBeenCalledOnceWith('choose-action');
  });
  it('transitions to begin-turn if there are more players waiting to execute turns', async () => {
    const fixture = TestBed.createComponent(CombatEndTurnStateComponent);
    const comp = fixture.componentInstance;
    const machine = testCombatGetStateMachine();
    const players = testCombatAddPartyCombatants(machine.store, machine);
    testCombatAddEnemyCombatants(machine);
    machine.turnList.push(players[0]);
    spyOn(machine, 'setCurrentState');
    comp.enter(machine);
    fixture.detectChanges();
    expect(machine.setCurrentState).toHaveBeenCalledOnceWith('begin-turn');
  });
});
