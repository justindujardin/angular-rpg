import {APP_RESOLVER_PROVIDERS} from './app.resolver';
import {LoadingService} from './components/loading/loading.service';
import {SERVICE_PROVIDERS} from './services/index';
import {MODEL_PROVIDERS} from './models/index';
import {CanActivateWorld} from './routes/world/world.guards';

export const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  ...SERVICE_PROVIDERS,
  ...MODEL_PROVIDERS,
  CanActivateWorld,
  LoadingService
];
