import {Routes} from '@angular/router';
import {NoContentComponent} from './routes/no-content';
import {GameComponent} from './routes/game/game.component';
import {GameResolver} from './routes/game/game.resolver';
import {WorldComponent} from './routes/world/world.component';
import {CanActivateWorld} from './routes/world/world.guards';
import {CombatComponent} from './routes/combat';
import {CanActivateCombat} from './routes/combat/combat.guards';

export const ROUTES: Routes = [
  {
    path: '',
    component: GameComponent,
    resolve: {
      gameState: GameResolver
    }
  },
  {
    path: 'combat/:id',
    component: CombatComponent,
    canActivate: [CanActivateCombat]
  },
  {
    path: 'world/:id',
    component: WorldComponent,
    canActivate: [CanActivateWorld]
  },
  {path: '**', component: NoContentComponent}
];
