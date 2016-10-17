import {GameComponent} from './routes/game/game.component';
import {NoContent} from './routes/no-content/no-content';
import {Loading} from './components/loading/loading.component';
import {App} from './app.component';
import {WorldComponent} from './routes/world/world.component';

export const APP_DECLARATIONS: any[] = [
  App,
  Loading,
  NoContent,
  WorldComponent,
  GameComponent
];
