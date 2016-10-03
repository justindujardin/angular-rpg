import {Routes} from '@angular/router';
import {Home} from './home';
import {About} from './about';
import {NoContent} from './no-content';
import {Game} from './game/game.component';


export const ROUTES: Routes = [
  {path: '', component: Game},
  {path: 'home', component: Home},
  {path: 'about', component: About},
  {path: 'game', component: Game},
  {path: 'detail', loadChildren: () => System.import('./+detail')},
  {path: '**', component: NoContent},
];
