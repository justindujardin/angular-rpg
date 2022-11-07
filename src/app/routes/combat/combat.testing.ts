import { QueryList } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.model';
import { testAppGetParty } from '../../app.testing';
import { IEnemy, IPartyMember } from '../../models/base-entity';
import { getEnemyById } from '../../models/game-data/enemies';
import { instantiateEntity } from '../../models/game-data/game-data.model';
import { Scene } from '../../scene/scene';
import { CombatEnemyComponent } from './combat-enemy.component';
import { CombatPlayerComponent } from './combat-player.component';
import { CombatStateMachineComponent } from './states';

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
  comp: CombatStateMachineComponent
): CombatPlayerComponent[] {
  const party = testAppGetParty(store);
  const players = [];
  for (let pm = 0; pm < party.length; pm++) {
    const member = party[pm] as IPartyMember;
    const player = TestBed.createComponent(CombatPlayerComponent);
    player.componentInstance.model = member;
    player.componentInstance.icon = member.icon;
    comp.scene.addObject(player.componentInstance);
    players.push(player.componentInstance);
  }
  comp.party = new QueryList<CombatPlayerComponent>();
  comp.party.reset(players);
  return players;
}

export function testCombatAddEnemyCombatants(
  comp: CombatStateMachineComponent
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
    comp.scene.addObject(fixture.componentInstance);
    enemies.push(fixture.componentInstance);
  }
  comp.enemies = new QueryList<CombatEnemyComponent>();
  comp.enemies.reset(enemies);
  return enemies;
}
