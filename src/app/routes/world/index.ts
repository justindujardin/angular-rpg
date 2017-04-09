import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CanActivateWorld} from './world.guards';
import {AppComponentsModule} from '../../components/index';
import {WORLD_PLAYER_COMPONENTS} from './map/world-player.entity';
import {BehaviorsModule} from '../../behaviors/index';
import {WORLD_MAP_COMPONENTS} from './map/world-map.entity';
import {WORLD_MAP_FEATURES} from './map/features/index';
import {PortalModule} from '@angular/material';
import {WorldComponent} from './world.component';

export const WORLD_PROVIDERS = [
  CanActivateWorld
];

export const WORLD_EXPORTS = [
  WorldComponent,
  ...WORLD_PLAYER_COMPONENTS,
  ...WORLD_MAP_COMPONENTS,
  ...WORLD_MAP_FEATURES
];

@NgModule({
  declarations: WORLD_EXPORTS,
  exports: WORLD_EXPORTS,
  imports: [
    PortalModule,
    CommonModule,
    BehaviorsModule,
    AppComponentsModule
  ]
})
export class WorldModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: WorldModule,
      providers: WORLD_PROVIDERS
    };
  }

}
