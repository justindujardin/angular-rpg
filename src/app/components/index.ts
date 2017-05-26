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
import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RPG_HEALTH_BAR_EXPORTS} from './health-bar/index';
import {RPG_LOADING_EXPORTS, RPG_LOADING_PROVIDERS} from './loading/index';
import {RPG_NOTIFICATION_EXPORTS, RPG_NOTIFICATION_PROVIDERS} from './notification/index';
import {RPG_PARTY_MENU_EXPORTS} from './party-menu/index';
import {RPG_PLAYER_CARD_EXPORTS} from './player-card/index';
import {RPG_PARTY_INVENTORY_EXPORTS} from './party-inventory/index';
import {RPG_SPRITE_EXPORTS} from './sprite/index';
import {
  MdButtonModule, MdButtonToggleModule, MdCardModule, MdIconModule, MdListModule, MdProgressBarModule, MdSidenavModule,
  MdToolbarModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RPG_PLAYER_STATS_EXPORTS} from './player-stats/index';

export * from './health-bar/index';
export * from './loading/index';
export * from './notification/index';
export * from './party-inventory/index';
export * from './party-menu/index';
export * from './player-card/index';
export * from './player-stats/index';
export * from './sprite/index';

/** Common game/application components */
export const APP_COMPONENTS_EXPORTS = [
  ...RPG_HEALTH_BAR_EXPORTS,
  ...RPG_LOADING_EXPORTS,
  ...RPG_NOTIFICATION_EXPORTS,
  ...RPG_PARTY_INVENTORY_EXPORTS,
  ...RPG_PARTY_MENU_EXPORTS,
  ...RPG_PLAYER_CARD_EXPORTS,
  ...RPG_PLAYER_STATS_EXPORTS,
  ...RPG_SPRITE_EXPORTS
];

/** Common component providers */
export const APP_COMPONENTS_PROVIDERS = [
  ...RPG_LOADING_PROVIDERS,
  ...RPG_NOTIFICATION_PROVIDERS,
];

@NgModule({
  declarations: APP_COMPONENTS_EXPORTS,
  exports: APP_COMPONENTS_EXPORTS,
  providers: APP_COMPONENTS_PROVIDERS,
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    FlexLayoutModule,
    MdSidenavModule,
    MdIconModule,
    MdListModule,
    MdCardModule,
    MdProgressBarModule,
    MdToolbarModule,
    MdButtonModule
  ]
})
export class AppComponentsModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AppComponentsModule
    };
  }

}
