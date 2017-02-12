import {WorldDialogComponent} from './world-dialog.component';
import {WorldStoreComponent} from './world-store.component';
import {WorldTempleComponent} from './world-temple.component';
import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CanActivateWorld} from './world.guards';
import {WorldComponent} from './';
import {AppComponentsModule} from '../../components/index';

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
  WorldTempleComponent
];

@NgModule({
  declarations: WORLD_EXPORTS,
  exports: WORLD_EXPORTS,
  imports: [
    CommonModule,
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
