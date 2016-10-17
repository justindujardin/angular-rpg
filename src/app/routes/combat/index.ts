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

import {NgModule, ModuleWithProviders} from '@angular/core';
import {CombatDamage} from './combatDamage';
import {CombatMap} from './combatMap';
import {CommonModule} from '@angular/common';
import {MaterialModule} from '@angular/material';
import {RpgModule} from '../../components/rpg/index';


export * from './chooseActionStates';
export * from './combatDamage';
export * from './combatMap';

export const COMBAT_EXPORTS = [
  CombatDamage,
  CombatMap
];

@NgModule({
  declarations: COMBAT_EXPORTS,
  exports: COMBAT_EXPORTS,
  imports: [
    MaterialModule,
    CommonModule,
    RpgModule
  ]
})
export class CombatModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CombatModule
    };
  }


}
