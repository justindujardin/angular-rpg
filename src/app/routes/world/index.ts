import {WorldDialogComponent} from './world-dialog.component';
import {WorldStoreComponent} from './world-store.component';
import {WorldTempleComponent} from './world-temple.component';
import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CanActivateWorld} from './world.guards';
import {WorldComponent} from './';
import {AppComponentsModule} from '../../components/index';
import {WORLD_PLAYER_COMPONENTS} from './world-player.entity';
import {BehaviorsModule} from '../../behaviors/index';
import {WORLD_MAP_COMPONENTS} from './world-map.entity';

export * from './world.component';
export * from './world-dialog.component';
export * from './world-store.component';
export * from './world-temple.component';

export const WORLD_PROVIDERS = [
  CanActivateWorld
];

export const WORLD_EXPORTS = [
  WorldComponent,
  WorldDialogComponent,
  WorldStoreComponent,
  WorldTempleComponent,
  ...WORLD_PLAYER_COMPONENTS,
  ...WORLD_MAP_COMPONENTS
];

@NgModule({
  declarations: WORLD_EXPORTS,
  exports: WORLD_EXPORTS,
  imports: [
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
