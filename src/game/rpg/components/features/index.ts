import {GameFeatureComponent} from '../gameFeatureComponent';
import {CombatFeatureComponent} from './combatFeatureComponent';
import {DialogFeatureComponent} from './dialogFeatureComponent';
import {PortalFeatureComponent} from './portalFeatureComponent';
import {ShipFeatureComponent} from './shipFeatureComponent';
import {TempleFeatureComponent} from './templeFeatureComponent';
import {TreasureFeatureComponent} from './treasureFeatureComponent';
import {StoreFeatureComponent} from './storeFeatureComponent';
export * from './combatFeatureComponent';
export * from './dialogFeatureComponent';
export * from './portalFeatureComponent';
export * from './shipFeatureComponent';
export * from './templeFeatureComponent';
export * from './treasureFeatureComponent';

export const ALL_FEATURES: Function[] = [
  CombatFeatureComponent,
  DialogFeatureComponent,
  PortalFeatureComponent,
  ShipFeatureComponent,
  StoreFeatureComponent,
  TempleFeatureComponent,
  TreasureFeatureComponent
];
