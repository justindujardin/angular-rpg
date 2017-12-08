import {GameResolver} from './routes/game/game.resolver';
import {WorldResolver} from './routes/world/world.resolver';

// an array of services to resolve routes with data
export const APP_RESOLVER_PROVIDERS = [
  GameResolver,
  WorldResolver,
];
