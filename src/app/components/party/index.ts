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

import {PartyInventory} from './partyInventory';
import {PartyMenu} from './partyMenu';
import {PlayerCard} from './playerCard';
import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RPGSpriteModule} from '../sprite';
import {RPGNotificationModule} from '../notification';
import {RPGHealthBarModule} from '../health-bar';

export * from './partyInventory';
export * from './partyMenu';
export * from './playerCard';

const PARTY_EXPORTS = [
  PartyInventory,
  PartyMenu,
  PlayerCard
];

@NgModule({
  declarations: PARTY_EXPORTS,
  exports: PARTY_EXPORTS,
  imports: [
    CommonModule,
    RPGSpriteModule,
    RPGNotificationModule,
    RPGHealthBarModule
  ]
})
export class PartyModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PartyModule
    };
  }


}
