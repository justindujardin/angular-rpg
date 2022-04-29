import { RouterState } from '@ngrx/router-store';
import { CombatState } from './models/combat/combat.model';
import { EntityState } from './models/entity/entity.reducer';
import { GameState } from './models/game-state/game-state.model';
import { SpriteState } from './models/sprites/sprites.model';

export interface AppState {
  router: RouterState;
  gameState: GameState;
  combat: CombatState;
  entities: EntityState;
  sprites: SpriteState;
}
