import {APP_RESOLVER_PROVIDERS} from './app.resolver';
import {SERVICE_PROVIDERS} from './services/index';
import {MODEL_PROVIDERS} from './models/index';
import {WORLD_PROVIDERS} from './routes/world/index';
import {AppEffects} from './app.effects';
import {COMBAT_PROVIDERS} from './routes/combat/index';

export const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  ...SERVICE_PROVIDERS,
  ...MODEL_PROVIDERS,
  ...WORLD_PROVIDERS,
  ...COMBAT_PROVIDERS,
  AppEffects
];
