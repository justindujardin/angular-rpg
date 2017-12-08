import {Routes} from '@angular/router';
import {NoContentComponent} from './routes/no-content';
import {GameComponent} from './routes/game/game.component';
import {GameResolver} from './routes/game/game.resolver';
import {WorldComponent} from './routes/world/world.component';
import {CanActivateWorld} from './routes/world/world.guards';
import {CombatComponent} from './routes/combat';
import {CanActivateCombat} from './routes/combat/combat.guards';
import {WorldResolver} from './routes/world/world.resolver';
import {HomeComponent} from './routes/home/home.component';

export const ROUTES: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: '',
    component: GameComponent,
    resolve: {
      gameState: GameResolver
    }
  },
  { path: 'editor/:id', loadChildren: './routes/+editor#EditorModule'},
  {
    path: 'combat/:id',
    component: CombatComponent,
    canActivate: [CanActivateCombat]
  },
  {
    path: 'world/:id',
    component: WorldComponent,
    canActivate: [CanActivateWorld],
    resolve: {
      gameState: WorldResolver
    }
  },
  {path: '**', component: NoContentComponent}
];
