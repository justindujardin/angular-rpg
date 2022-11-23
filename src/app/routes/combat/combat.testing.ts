import { QueryList } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { List } from 'immutable';
import { take } from 'rxjs/operators';
import { AppState } from '../../app.model';
import { testAppGetParty } from '../../app.testing';
import { IEnemy, IPartyMember } from '../../models/base-entity';
import { CombatEncounterAction } from '../../models/combat/combat.actions';
import { CombatEncounter } from '../../models/combat/combat.model';
import { Entity } from '../../models/entity/entity.model';
import { getEnemyById } from '../../models/game-data/enemies';
import {
  instantiateEntity,
  ITemplateFixedEncounter,
  ITemplateRandomEncounter,
} from '../../models/game-data/game-data.model';
import { RANDOM_ENCOUNTERS_DATA } from '../../models/game-data/random-encounters';
import { getCombatEncounter } from '../../models/selectors';
import { Scene } from '../../scene/scene';
import { CombatEnemyComponent } from './combat-enemy.component';
import { CombatPlayerComponent } from './combat-player.component';
import { CombatComponent } from './combat.component';
import { CombatStateMachineComponent } from './states';
import { CombatStateNames } from './states/states';

export function testCombatGetStateMachine(): CombatStateMachineComponent {
  const fixture = TestBed.createComponent(CombatStateMachineComponent);
  const comp: CombatStateMachineComponent = fixture.componentInstance;
  comp.scene = new Scene();
  comp.party = new QueryList();
  comp.enemies = new QueryList();
  fixture.detectChanges();
  return comp;
}

export function testCombatAddPartyCombatants(
  store: Store<AppState>,
  comp: CombatComponent,
  onlyFirst: boolean = false
): CombatPlayerComponent[] {
  const party = testAppGetParty(store);
  const players = [];

  for (let pm = 0; pm < party.length; pm++) {
    if (onlyFirst && pm > 0) {
      break;
    }
    const member = party[pm] as IPartyMember;
    const player = TestBed.createComponent(CombatPlayerComponent);
    player.componentInstance.model = member;
    player.componentInstance.icon = member.icon;
    player.componentInstance.combat = comp;
    comp.scene.addObject(player.componentInstance);
    player.detectChanges();
    players.push(player.componentInstance);
  }
  comp.party = new QueryList<CombatPlayerComponent>();
  comp.party.reset(players);
  return players;
}

export function testCombatAddEnemyCombatants(
  comp: CombatComponent
): CombatEnemyComponent[] {
  const items = ['imp', 'imp', 'imp'].map((id) => {
    const itemTemplate: IEnemy = getEnemyById(id) as any;
    return instantiateEntity<IEnemy>(itemTemplate, {
      maxhp: itemTemplate.hp,
    });
  });
  const enemies = [];
  for (let i = 0; i < items.length; i++) {
    const obj = items[i] as IEnemy;
    const fixture = TestBed.createComponent(CombatEnemyComponent);
    fixture.componentInstance.model = obj;
    fixture.componentInstance.icon = obj.icon;
    fixture.componentInstance.combat = comp;
    comp.scene.addObject(fixture.componentInstance);
    enemies.push(fixture.componentInstance);
    fixture.detectChanges();
  }
  comp.enemies = new QueryList<CombatEnemyComponent>();
  comp.enemies.reset(enemies);
  return enemies;
}

export function testCombatSetEnemyCombatants(
  comp: CombatStateMachineComponent,
  enemies: IEnemy[]
): CombatEnemyComponent[] {
  const results = [];
  for (let i = 0; i < enemies.length; i++) {
    const obj = enemies[i] as IEnemy;
    const fixture = TestBed.createComponent(CombatEnemyComponent);
    fixture.componentInstance.model = obj;
    fixture.componentInstance.icon = obj.icon;
    fixture.componentInstance.combat = comp;
    comp.scene.addObject(fixture.componentInstance);
    results.push(fixture.componentInstance);
    fixture.detectChanges();
  }
  comp.enemies = new QueryList<CombatEnemyComponent>();
  comp.enemies.reset(results);
  return results;
}

export function testCombatSetRandomEncounter(
  store: Store<AppState>,
  party: Entity[],
  encounter: ITemplateRandomEncounter
) {
  const toCombatant = (id: string): IEnemy => {
    const itemTemplate: IEnemy = getEnemyById(id) as any;
    return instantiateEntity<IEnemy>(itemTemplate, {
      maxhp: itemTemplate.hp,
    });
  };

  const zone = encounter.zones.length ? encounter.zones[0] : 'none';
  const enemies = List<IEnemy>(encounter.enemies.map(toCombatant));

  const payload: CombatEncounter = {
    type: 'random',
    id: encounter.id,
    enemies,
    zone,
    gold: 0,
    items: List<string>([]),
    message: List<string>(encounter.message || []),
    party: List<Entity>(party),
  };
  store.dispatch(new CombatEncounterAction(payload));
  return enemies.toJS();
}

export function testCombatSetFixedEncounter(
  store: Store<AppState>,
  party: Entity[],
  encounter: ITemplateFixedEncounter
) {
  const toCombatant = (id: string): IEnemy => {
    const itemTemplate: IEnemy = getEnemyById(id) as any;
    return instantiateEntity<IEnemy>(itemTemplate, {
      maxhp: itemTemplate.hp,
    });
  };

  const payload: CombatEncounter = {
    type: 'fixed',
    id: encounter.id,
    enemies: List<IEnemy>(encounter.enemies.map(toCombatant)),
    zone: '',
    gold: encounter.gold,
    items: List<string>(encounter.items || []),
    message: List<string>(encounter.message || []),
    experience: encounter.experience,
    party: List<Entity>(party),
  };
  store.dispatch(new CombatEncounterAction(payload));
}

export function testCombatGetEncounter(store: Store<AppState>): CombatEncounter {
  let result: CombatEncounter | undefined;
  store
    .select(getCombatEncounter)
    .pipe(take(1))
    .subscribe((s) => (result = s));
  return result as CombatEncounter;
}

export function testCombatCreateComponent(
  defaultState?: CombatStateNames | null,
  encounter = RANDOM_ENCOUNTERS_DATA[0]
): CombatComponent {
  const { combat } = testCombatCreateComponentFixture(defaultState, encounter);
  return combat;
}

export function testCombatCreateComponentFixture(
  defaultState: CombatStateNames | null = null,
  encounter = RANDOM_ENCOUNTERS_DATA[0]
) {
  const combatFixture = TestBed.createComponent(CombatComponent);
  const store = combatFixture.componentInstance.store;
  const combatComp = combatFixture.componentInstance;
  combatComp.defaultState = null;
  if (defaultState) {
    combatComp.defaultState = defaultState;
  }
  if (encounter) {
    const party = testAppGetParty(store);
    testCombatSetRandomEncounter(store, party, encounter);
  }
  combatFixture.detectChanges();
  return { fixture: combatFixture, combat: combatComp, machine: combatComp.machine };
}
