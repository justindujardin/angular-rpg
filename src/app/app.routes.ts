import {Routes} from '@angular/router';
import {NoContent} from './routes/no-content';
import {GameComponent} from './routes/game/game.component';
import {GameResolver} from './routes/game/game.resolver';
import {WorldComponent} from './routes/world/world.component';
import {CanActivateWorld} from './routes/world/world.guards';
import {WorldResolver} from './routes/world/world.resolver';


export const ROUTES: Routes = [
  {
    path: '',
    component: GameComponent,
    resolve: {
      gameState: GameResolver
    }
  },
  {
    path: 'world/:id',
    component: WorldComponent,
    canActivate: [CanActivateWorld],
    resolve: {
      world: WorldResolver
    }
  },
  {path: '**', component: NoContent},
];
