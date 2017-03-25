import {GameState} from './models/game-state/game-state.model';
import {RouterState} from '@ngrx/router-store';
import {CombatState} from './models/combat/combat.model';
import {EntityState} from './models/entity/entity.reducer';
import {GameDataState} from './models/game-data/game-data.reducer';

export interface AppState {
  router: RouterState;
  gameData: GameDataState;
  gameState: GameState;
  combat: CombatState;
  entities: EntityState;
}
