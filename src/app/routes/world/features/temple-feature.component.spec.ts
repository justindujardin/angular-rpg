import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { APP_IMPORTS } from '../../../app.imports';
import { AppState } from '../../../app.model';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { EntityWithEquipment } from '../../../models/entity/entity.model';
import { GameStateHurtPartyAction } from '../../../models/game-state/game-state.actions';
import { getGamePartyGold, getGamePartyWithEquipment } from '../../../models/selectors';
import { GameWorld } from '../../../services/game-world';
import { RPGGame } from '../../../services/rpg-game';
import {
  ITempleFeatureProperties,
  TempleFeatureComponent,
} from './temple-feature.component';

const TEMPLE_FEATURE: ITiledObject<ITempleFeatureProperties> = {
  name: 'test temple',
  class: 'TempleFeatureComponent',
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  visible: true,
  properties: {
    cost: 10,
  },
};

function getPartyWithEquipment(store: Store<AppState>): EntityWithEquipment[] {
  let newParty: EntityWithEquipment[] = [];
  store
    .select(getGamePartyWithEquipment)
    .pipe(map((f) => f.toJS()))
    .subscribe((s) => (newParty = s));
  return newParty;
}

function getPartyGold(store: Store<AppState>): number {
  let partyGold = 0;
  store.select(getGamePartyGold).subscribe((s) => (partyGold = s));
  return partyGold;
}

function damageParty(
  store: Store<AppState>,
  party: EntityWithEquipment[],
  damage: number
) {
  store.dispatch(
    new GameStateHurtPartyAction({ partyIds: party.map((p) => p.eid), damage })
  );
}

describe('TempleFeatureComponent', () => {
  let world: GameWorld;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [TempleFeatureComponent],
    }).compileComponents();
    world = TestBed.inject(GameWorld);
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
  });

  it('should heal party when resting', async () => {
    const fixture = TestBed.createComponent(TempleFeatureComponent);
    const comp: TempleFeatureComponent = fixture.componentInstance;
    comp.feature = TEMPLE_FEATURE;
    fixture.detectChanges();
    const party = getPartyWithEquipment(world.store);

    // Party at max health
    party.forEach((p) => expect(p.maxhp).toBe(p.hp));

    // Damage party
    damageParty(world.store, party, 10);

    // Assert members are damaged by 10
    getPartyWithEquipment(world.store).forEach((p) => expect(p.hp).toBe(p.maxhp - 10));

    comp._onRest$.next();

    // Party at max health again
    getPartyWithEquipment(world.store).forEach((p) => expect(p.maxhp).toBe(p.hp));
  });
  it('should fail to heal when party does not have enough money', async () => {
    const fixture = TestBed.createComponent(TempleFeatureComponent);
    const comp: TempleFeatureComponent = fixture.componentInstance;
    comp.feature = { ...TEMPLE_FEATURE, properties: { cost: 200 } };
    fixture.detectChanges();
    const party = getPartyWithEquipment(world.store);

    // Damage party
    damageParty(world.store, party, 10);

    // Assert members are damaged by 10
    getPartyWithEquipment(world.store).forEach((p) => expect(p.hp).toBe(p.maxhp - 10));

    comp._onRest$.next();

    // Party still at damaged health
    getPartyWithEquipment(world.store).forEach((p) => expect(p.hp).toBe(p.maxhp - 10));
  });
  it('should not take money when party is already healed', async () => {
    const fixture = TestBed.createComponent(TempleFeatureComponent);
    const comp: TempleFeatureComponent = fixture.componentInstance;
    comp.feature = TEMPLE_FEATURE;
    fixture.detectChanges();
    const party = getPartyWithEquipment(world.store);
    // Party at full health
    getPartyWithEquipment(world.store).forEach((p) => expect(p.hp).toBe(p.maxhp));
    expect(getPartyGold(world.store)).toBe(100);

    comp._onRest$.next();

    // Still at 100 gold
    expect(getPartyGold(world.store)).toBe(100);
  });
});
