import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { BehaviorsModule } from '../../behaviors/index';
import { AppComponentsModule } from '../../components/index';
import { WORLD_MAP_FEATURES, WORLD_MAP_FEATURES_IMPORTS } from './map/features/index';
import { WORLD_MAP_COMPONENTS } from './map/world-map.entity';
import { WORLD_PLAYER_COMPONENTS } from './map/world-player.entity';
import { WorldComponent } from './world.component';
import { CanActivateWorld } from './world.guards';

export const WORLD_PROVIDERS = [CanActivateWorld];

export const WORLD_EXPORTS = [
  ...[WorldComponent],
  ...WORLD_PLAYER_COMPONENTS,
  ...WORLD_MAP_COMPONENTS,
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
