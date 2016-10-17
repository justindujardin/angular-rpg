
import {GameState} from './models/game-state/game-state.model';
import {ItemState} from './models/item/item.reducer';
import {RouterState} from '@ngrx/router-store';

export interface AppState {
  router: RouterState;
  items: ItemState;
  gameState: GameState;
}
