import { RouterState } from '@ngrx/router-store';
import { CombatState } from './models/combat/combat.model';
import { EntityState } from './models/entity/entity.reducer';
import { GameDataState } from './models/game-data/game-data.reducer';
import { GameState } from './models/game-state/game-state.model';
import { SpriteState } from './models/sprites/sprites.model';

export interface AppState {
  router: RouterState;
  gameData: GameDataState;
  gameState: GameState;
  combat: CombatState;
  entities: EntityState;
  sprites: SpriteState;
}
