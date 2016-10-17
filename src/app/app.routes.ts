import {Routes} from '@angular/router';
import {NoContent} from './routes/no-content';
import {Game} from './routes/game/game.component';
import {GameResolver} from './routes/game/game.resolver';


export const ROUTES: Routes = [
  {
    path: '',
    component: Game,
    resolve: {
      gameState: GameResolver
    }
  },
  {path: '**', component: NoContent},
];
