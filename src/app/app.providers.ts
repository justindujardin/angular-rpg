import { AppEffects } from './app.effects';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { MODEL_PROVIDERS } from './models/index';
import { COMBAT_PROVIDERS } from './routes/combat/index';
import { WORLD_PROVIDERS } from './routes/world/index';
import { SERVICE_PROVIDERS } from './services/index';

export const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  ...SERVICE_PROVIDERS,
  ...MODEL_PROVIDERS,
  ...WORLD_PROVIDERS,
  ...COMBAT_PROVIDERS,
  AppEffects,
];
