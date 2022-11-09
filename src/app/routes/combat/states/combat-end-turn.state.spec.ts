import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../../app.imports';
import { APP_TESTING_PROVIDERS } from '../../../app.testing';
import { ITemplateRandomEncounter } from '../../../models/game-data/game-data.model';
import { RANDOM_ENCOUNTERS_DATA } from '../../../models/game-data/random-encounters';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import { CombatPlayerComponent } from '../combat-player.component';
import {
  testCombatCreateComponent,
  testCombatGetStateMachine,
} from '../combat.testing';
import { CombatEndTurnStateComponent } from './combat-end-turn.state';

describe('CombatEndTurnStateComponent', () => {
  let world: GameWorld;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [CombatEndTurnStateComponent],
      providers: [...APP_TESTING_PROVIDERS],
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
    await comp.enter(machine);
    fixture.detectChanges();
    expect(machine.setCurrentState).toHaveBeenCalledOnceWith('defeat');
  });
  it('transitions to victory if no live enemies', async () => {
    const fixture = TestBed.createComponent(CombatEndTurnStateComponent);
    const comp = fixture.componentInstance;
    const encounter: ITemplateRandomEncounter = {
      ...RANDOM_ENCOUNTERS_DATA[0],
      enemies: [],
    };
    const combat = testCombatCreateComponent('start', encounter);
    const machine = combat.machine;
    spyOn(machine, 'setCurrentState');
    await comp.enter(machine);
    fixture.detectChanges();
    expect(machine.setCurrentState).toHaveBeenCalledOnceWith('victory');
  });
  it('transitions to choose-action if living enemies and party', async () => {
    const fixture = TestBed.createComponent(CombatEndTurnStateComponent);
    const comp = fixture.componentInstance;
    const combat = testCombatCreateComponent();
    const machine = combat.machine;
    spyOn(machine, 'setCurrentState');
    await comp.enter(machine);
    fixture.detectChanges();
    expect(machine.setCurrentState).toHaveBeenCalledOnceWith('choose-action');
  });
  it('transitions to begin-turn if there are more players waiting to execute turns', async () => {
    const fixture = TestBed.createComponent(CombatEndTurnStateComponent);
    const comp = fixture.componentInstance;
    const combat = testCombatCreateComponent();
    const machine = combat.machine;
    const player = combat.party.get(0) as CombatPlayerComponent;
    machine.turnList.push(player);
    spyOn(machine, 'setCurrentState');
    await comp.enter(machine);
    fixture.detectChanges();
    expect(machine.setCurrentState).toHaveBeenCalledOnceWith('begin-turn');
  });
});
