import {GameState} from './models/game-state/game-state.model';
import {ItemState} from './models/item/item.reducer';
import {RouterState} from '@ngrx/router-store';
import {CombatState} from './models/combat/combat.model';
import {EntityState} from './models/entity/entity.reducer';

export interface AppState {
  router: RouterState;
  items: ItemState;
  gameState: GameState;
  combat: CombatState;
  entities: EntityState;
}
