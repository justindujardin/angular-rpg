import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule as MatButtonModule } from '@angular/material/button';
import { BehaviorsModule } from '../../behaviors/index';
import { AppComponentsModule } from '../../components/index';
import { MapFeatureInputBehaviorComponent } from './behaviors/map-feature-input.behavior';
import { WORLD_MAP_FEATURES, WORLD_MAP_FEATURES_IMPORTS } from './features/index';
import { MapFeatureComponent } from './map-feature.component';
import { WORLD_PLAYER_COMPONENTS } from './world-player.component';
import { WorldComponent } from './world.component';
import { CanActivateWorld } from './world.guards';

export const WORLD_PROVIDERS = [CanActivateWorld];

export const WORLD_EXPORTS = [
  WorldComponent,
  MapFeatureComponent,
  MapFeatureInputBehaviorComponent,
  ...WORLD_PLAYER_COMPONENTS,
  ...WORLD_MAP_FEATURES,
];

@NgModule({
  declarations: WORLD_EXPORTS,
  exports: WORLD_EXPORTS,
  imports: [
    PortalModule,
    CommonModule,
    BehaviorsModule,
    AppComponentsModule,
    MatButtonModule,
    ...WORLD_MAP_FEATURES_IMPORTS,
  ],
})
export class WorldModule {
  static forRoot(): ModuleWithProviders<WorldModule> {
    return {
      ngModule: WorldModule,
      providers: WORLD_PROVIDERS,
    };
  }
}
