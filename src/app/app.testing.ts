import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { AppState } from './app.model';
import {
  INotifyItem,
  NotificationService,
} from './components/notification/notification.service';
import { IPartyMember } from './models/base-entity';
import { EntityAddItemAction } from './models/entity/entity.actions';
import { EntityWithEquipment } from './models/entity/entity.model';
import { EntityItemTypes } from './models/entity/entity.reducer';
import {
  instantiateEntity,
  ITemplateBaseItem,
} from './models/game-data/game-data.model';
import {
  GameStateAddInventoryAction,
  GameStateHurtPartyAction,
} from './models/game-state/game-state.actions';
import { Item } from './models/item';
import {
  getGameBoardedShip,
  getGameInventory,
  getGameKey,
  getGameParty,
  getGamePartyGold,
  getGamePartyWithEquipment,
} from './models/selectors';
import { SpritesService } from './models/sprites/sprites.service';
import { WindowService } from './services/window';

/**
 * Testing providers for the app.
 */
export const APP_TESTING_PROVIDERS = [
  {
    // Mock reload() so it doesn't actually reload the page
    provide: WindowService,
    useValue: {
      reload: jasmine.createSpy('reload'),
    },
  },
];

export function testAppGetBoarded(store: Store<AppState>): boolean {
  let result: boolean = false;
  store
    .select(getGameBoardedShip)
    .pipe(take(1))
    .subscribe((s) => (result = s));
  return result;
}

export function testAppGetKeyData(
  store: Store<AppState>,
  keyName?: string,
): boolean | undefined {
  if (!keyName) {
    return false;
  }
  let result: boolean | undefined = undefined;
  store
    .select(getGameKey(keyName))
    .pipe(take(1))
    .subscribe((s) => (result = s));
  return result;
}

export function testAppGetParty(store: Store<AppState>): IPartyMember[] {
  let result: IPartyMember[] = [];
  store
    .select(getGameParty)
    .pipe(
      map((f) => f.toJS()),
      take(1),
    )
    .subscribe((s) => (result = s));
  return result;
}

export function testAppGetPartyWithEquipment(
  store: Store<AppState>,
): EntityWithEquipment[] {
  let result: EntityWithEquipment[] = [];
  store
    .select(getGamePartyWithEquipment)
    .pipe(
      map((f) => f.toJS()),
      take(1),
    )
    .subscribe((s) => (result = s));
  return result;
}

export function testAppGetInventory(store: Store<AppState>): EntityItemTypes[] {
  let result: EntityItemTypes[] | undefined;
  store
    .select(getGameInventory)
    .pipe(
      take(1),
      map((f) => f.toJS()),
    )
    .subscribe((s) => (result = s));
  return result as EntityItemTypes[];
}

export function testAppGetPartyGold(store: Store<AppState>): number {
  let result = 0;
  store
    .select(getGamePartyGold)
    .pipe(take(1))
    .subscribe((s) => (result = s));
  return result;
}

export function testAppAddToInventory<T extends Item>(
  store: Store<AppState>,
  itemId: string,
  from: ITemplateBaseItem[],
  values?: Partial<T>,
): T {
  const itemInstance = instantiateEntity<T>(
    from.find((f) => f.id === itemId),
    values,
  );
  store.dispatch(new EntityAddItemAction(itemInstance));
  store.dispatch(new GameStateAddInventoryAction(itemInstance));
  return itemInstance;
}

export function testAppDamageParty(
  store: Store<AppState>,
  party: EntityWithEquipment[],
  damage: number,
) {
  store.dispatch(
    new GameStateHurtPartyAction({ partyIds: party.map((p) => p.eid), damage }),
  );
}

export async function testAppLoadSprites() {
  const spritesService = TestBed.inject(SpritesService);
  await spritesService.loadSprites('assets/images/index.json').toPromise();
}

/**
 * Returns a provider that mocks out the show() calls in the notification
 * service so that there is no wait while messages are shown.
 * @returns
 */
export function testAppMockNotificationService() {
  const spy: jasmine.SpyObj<NotificationService> = jasmine.createSpyObj(
    'NotificationService',
    ['show', 'dismiss'],
  );
  spy.show.and.callFake(
    (message: string, done: () => void, duration?: number): INotifyItem => {
      if (done) {
        done();
      }
      const obj: INotifyItem = {
        message,
        done,
        elapsed: 0,
        duration: 0,
      };
      return obj;
    },
  );
  return { provide: NotificationService, useValue: spy };
}
