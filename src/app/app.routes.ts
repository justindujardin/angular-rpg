import { Routes } from '@angular/router';
import { CombatComponent } from './routes/combat';
import { CanActivateCombat } from './routes/combat/combat.guards';
import { GameComponent } from './routes/game/game.component';
import { GameResolver } from './routes/game/game.resolver';
import { NoContentComponent } from './routes/no-content';
import { WorldComponent } from './routes/world/world.component';
import { CanActivateWorld } from './routes/world/world.guards';

export const ROUTES: Routes = [
  {
    path: '',
    component: GameComponent,
    resolve: {
      gameState: GameResolver,
    },
  },
  {
    path: 'combat/:id',
    component: CombatComponent,
    canActivate: [CanActivateCombat],
  },
  {
    path: 'world/:id',
    component: WorldComponent,
    canActivate: [CanActivateWorld],
  },
  { path: '**', component: NoContentComponent },
];
