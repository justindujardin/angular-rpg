import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MapFeatureComponent } from '../map-feature.component';
import { BlockFeatureComponent } from './block-feature.component';
import { CombatFeatureComponent } from './combat-feature.component';
import { DialogFeatureComponent } from './dialog-feature.component';
import { DoorFeatureComponent } from './door-feature.component';
import { PortalFeatureComponent } from './portal-feature.component';
import { ShipFeatureComponent } from './ship-feature.component';
import { StoreFeatureComponent } from './store-feature.component';
import { ArmorsStoreFeatureComponent } from './stores/armors-store-feature.component';
import { ItemsStoreFeatureComponent } from './stores/items-store-feature.component';
import { MagicsStoreFeatureComponent } from './stores/magics-store-feature.component';
import { WeaponsStoreFeatureComponent } from './stores/weapons-store-feature.component';
import { TempleFeatureComponent } from './temple-feature.component';
import { TreasureFeatureComponent } from './treasure-feature.component';
export * from './combat-feature.component';
export * from './dialog-feature.component';
export * from './door-feature.component';
export * from './portal-feature.component';
export * from './ship-feature.component';
export * from './stores/armors-store-feature.component';
export * from './stores/items-store-feature.component';
export * from './stores/magics-store-feature.component';
export * from './stores/weapons-store-feature.component';
export * from './temple-feature.component';
export * from './treasure-feature.component';

export const WORLD_MAP_FEATURES = [
  MapFeatureComponent,
  DoorFeatureComponent,
  CombatFeatureComponent,
  DialogFeatureComponent,
  BlockFeatureComponent,
  PortalFeatureComponent,
  ShipFeatureComponent,
  TempleFeatureComponent,
  TreasureFeatureComponent,
  ArmorsStoreFeatureComponent,
  ItemsStoreFeatureComponent,
  MagicsStoreFeatureComponent,
  WeaponsStoreFeatureComponent,
  StoreFeatureComponent,
];

export const WORLD_MAP_FEATURES_IMPORTS = [
  MatTableModule,
  MatSortModule,
  MatTabsModule,
];
