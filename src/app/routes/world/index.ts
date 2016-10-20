/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import {WorldDialog} from './world-dialog.component';
import {WorldStore} from './world-store.component';
import {WorldTemple} from './world-temple.component';
import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CanActivateWorld} from './world.guards';
import {WorldEffects} from './world.effects';
import {WorldComponent} from './';
import {RPGSpriteModule} from '../../components/sprite';
import {RPGNotificationModule} from '../../components/notification';
import {RPGHealthBarModule} from '../../components/health-bar';

export * from './world.component';
export * from './world.effects';
export * from './world-dialog.component';
export * from './world-store.component';
export * from './world-temple.component';

export const WORLD_PROVIDERS = [
  CanActivateWorld,
  WorldEffects
];

const WORLD_EXPORTS = [
  WorldComponent,
  WorldDialog,
  WorldStore,
  WorldTemple
];

@NgModule({
  declarations: WORLD_EXPORTS,
  exports: WORLD_EXPORTS,
  imports: [
    CommonModule,
    RPGSpriteModule,
    RPGHealthBarModule,
    RPGNotificationModule
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
