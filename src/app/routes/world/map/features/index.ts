import {MapFeatureComponent} from '../map-feature.component';
import {CombatFeatureComponent} from './combat-feature.component';
import {DialogFeatureComponent} from './dialog-feature.component';
import {PortalFeatureComponent} from './portal-feature.component';
import {ShipFeatureComponent} from './ship-feature.component';
import {TempleFeatureComponent} from './temple-feature.component';
import {TreasureFeatureComponent} from './treasure-feature.component';
import {StoreFeatureComponent} from './store-feature.component';
export * from './combat-feature.component';
export * from './dialog-feature.component';
export * from './portal-feature.component';
export * from './ship-feature.component';
export * from './store-feature.component';
export * from './temple-feature.component';
export * from './treasure-feature.component';

export const WORLD_MAP_FEATURES = [
  MapFeatureComponent,
  CombatFeatureComponent,
  DialogFeatureComponent,
  PortalFeatureComponent,
  ShipFeatureComponent,
  StoreFeatureComponent,
  TempleFeatureComponent,
  TreasureFeatureComponent
];
