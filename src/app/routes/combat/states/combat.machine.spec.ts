import { QueryList } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { APP_IMPORTS } from '../../../app.imports';
import { AppState } from '../../../app.model';
import { IEnemy, IPartyMember } from '../../../models/base-entity';
import { EntityAddItemAction } from '../../../models/entity/entity.actions';
import { ARMOR_DATA } from '../../../models/game-data/armors';
import { getEnemyById } from '../../../models/game-data/enemies';
import {
  instantiateEntity,
  ITemplateBaseItem,
} from '../../../models/game-data/game-data.model';
import { ITEMS_DATA } from '../../../models/game-data/items';
import { MAGIC_DATA } from '../../../models/game-data/magic';
import { WEAPONS_DATA } from '../../../models/game-data/weapons';
import { GameStateAddInventoryAction } from '../../../models/game-state/game-state.actions';
import { Item } from '../../../models/item';
import { getGameParty } from '../../../models/selectors';
import { Scene } from '../../../scene/scene';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import { CombatEnemyComponent } from '../combat-enemy.component';
import { CombatPlayerComponent } from '../combat-player.component';
import { CombatStateMachineComponent } from './combat.machine';

function getParty(store: Store<AppState>): IPartyMember[] {
  let result: IPartyMember[] = [];
  store
    .select(getGameParty)
    .pipe(
      map((f) => f.toJS()),
      take(1)
    )
    .subscribe((s) => (result = s));
  return result;
}

function addToInventory<T extends Item>(
  store: Store<AppState>,
  itemId: string,
  from: ITemplateBaseItem[],
  values?: Partial<T>
): T {
  const itemInstance = instantiateEntity<T>(
    from.find((f) => f.id === itemId),
    values
  );
  store.dispatch(new EntityAddItemAction(itemInstance));
  store.dispatch(new GameStateAddInventoryAction(itemInstance));
  return itemInstance;
}

function addPartyCombatants(
  store: Store<AppState>,
  comp: CombatStateMachineComponent
): CombatPlayerComponent[] {
  const party = getParty(store);
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

function addEnemyCombatants(comp: CombatStateMachineComponent): CombatEnemyComponent[] {
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

function getFixture() {
  const fixture = TestBed.createComponent(CombatStateMachineComponent);
  const comp: CombatStateMachineComponent = fixture.componentInstance;
  comp.scene = new Scene();
  fixture.detectChanges();
  return { fixture, comp };
}

describe('CombatStateMachineComponent', () => {
  let world: GameWorld;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [CombatStateMachineComponent],
    }).compileComponents();
    world = TestBed.inject(GameWorld);
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
  });

  it('initializes with defaultState', async () => {
    const { fixture, comp } = getFixture();
    await fixture.whenRenderingDone();
    expect(comp.getCurrentName()).toBe(comp.defaultState);
  });
  it('exposes weapons/armor/items/spells from inventory', async () => {
    const { fixture, comp } = getFixture();
    addToInventory(world.store, 'short-sword', WEAPONS_DATA);
    addToInventory(world.store, 'leather-armor', ARMOR_DATA);
    addToInventory(world.store, 'push', MAGIC_DATA);
    addToInventory(world.store, 'heal', MAGIC_DATA);
    addToInventory(world.store, 'potion', ITEMS_DATA);
    addToInventory(world.store, 'potion', ITEMS_DATA);
    addToInventory(world.store, 'potion', ITEMS_DATA);
    fixture.detectChanges();
    expect(comp.weapons.size).toBe(1);
    expect(comp.spells.size).toBe(2);
    expect(comp.armors.size).toBe(1);
    expect(comp.items.size).toBe(3);
  });
  describe('isFriendlyTurn', () => {
    it('returns false if there is no current player/party', async () => {
      const { fixture, comp } = getFixture();
      comp.current = null;
      comp.enemies = new QueryList<CombatEnemyComponent>();
      comp.party = null;
      fixture.detectChanges();
      expect(comp.isFriendlyTurn()).toBe(false);
    });
    it('returns true if the current player is in the party', async () => {
      const { fixture, comp } = getFixture();

      const players = addPartyCombatants(world.store, comp);
      comp.current = players[0];
      fixture.detectChanges();
      expect(comp.isFriendlyTurn()).toBe(true);
    });
  });
  describe('getLiveParty', () => {
    it('returns empty array if the party is undefined', async () => {
      const { fixture, comp } = getFixture();

      comp.party = null;
      fixture.detectChanges();
      expect(comp.getLiveParty().length).toBe(0);
    });
    it('returns array of party members with hp > 0', async () => {
      const { fixture, comp } = getFixture();

      const players = addPartyCombatants(world.store, comp);
      fixture.detectChanges();
      expect(comp.getLiveParty().length).toEqual(3);

      // Excludes 0 hp members
      players[0].model = { ...players[0].model, hp: 0 };
      expect(comp.getLiveParty().length).toEqual(2);
    });
  });
  describe('getLiveEnemies', () => {
    it('returns empty array if the party is undefined', async () => {
      const { fixture, comp } = getFixture();

      comp.enemies = null;
      fixture.detectChanges();
      expect(comp.getLiveEnemies().length).toBe(0);
    });
    it('returns array of party members with hp > 0', async () => {
      const { fixture, comp } = getFixture();

      const objects = addEnemyCombatants(comp);
      fixture.detectChanges();
      expect(comp.getLiveEnemies().length).toEqual(3);

      // Excludes 0 hp members
      const enemyModel = objects[0].model as IEnemy;
      objects[0].model = { ...enemyModel, hp: 0 };
      expect(comp.getLiveEnemies().length).toEqual(2);
    });
  });
  describe('getRandomPartyMember', () => {
    it('returns empty array if the party is undefined', async () => {
      const { fixture, comp } = getFixture();

      fixture.detectChanges();
      comp.party = null;
      expect(comp.getRandomPartyMember()).toBe(null);
    });
    it('returns true if the current player is in the party', async () => {
      const { fixture, comp } = getFixture();

      const players = addPartyCombatants(world.store, comp);
      fixture.detectChanges();
      expect(comp.getRandomPartyMember()).not.toBeNull();
      // Excludes null/undefined items in party
      comp.party?.reset([undefined as any]);
      expect(comp.getRandomPartyMember()).toBeNull();

      // Returns nothing with all defeated models
      players.forEach((p) => {
        p.model = { ...p.model, hp: 0 };
      });
      comp.party?.reset(players);
      expect(comp.getRandomPartyMember()).toBeNull();
    });
  });
  describe('getRandomEnemy', () => {
    it('returns empty array if the party is undefined', async () => {
      const { fixture, comp } = getFixture();

      fixture.detectChanges();
      comp.enemies = null;
      expect(comp.getRandomEnemy()).toBe(null);
    });
    it('returns true if the current player is in the party', async () => {
      const { fixture, comp } = getFixture();

      const enemies = addEnemyCombatants(comp);
      fixture.detectChanges();
      expect(comp.getRandomEnemy()).not.toBeNull();
      // Excludes null/undefined items in party
      comp.enemies?.reset([undefined as any]);
      expect(comp.getRandomEnemy()).toBeNull();

      // Returns nothing with all defeated models
      enemies.forEach((p) => {
        p.model = { ...p.model, hp: 0 } as IEnemy;
      });
      comp.enemies?.reset(enemies);
      expect(comp.getRandomEnemy()).toBeNull();
    });
  });
});
