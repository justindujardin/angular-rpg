import {APP_RESOLVER_PROVIDERS} from './app.resolver';
import {LoadingService} from './components/loading/loading.service';
import {ItemActions} from './models/item/item.actions';
import {SERVICE_PROVIDERS} from './services/index';

export const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  ...SERVICE_PROVIDERS,
  LoadingService,
  ItemActions
];
