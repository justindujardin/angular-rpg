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
import {CombatDamage} from './combat-damage.component';
import {CombatComponent} from './combat.component';
import {CommonModule} from '@angular/common';
import {MaterialModule} from '@angular/material';
import {RPGHealthBarModule} from '../../components/health-bar';
import {CanActivateCombat} from './combat.guards';
import {COMBAT_PLAYER_COMPONENTS} from './combat-player.entity';
import {BehaviorsModule} from '../../behaviors/index';
import {COMBAT_ENEMY_COMPONENTS} from './combat-enemy.entity';


export * from './combat-damage.component';
export * from './combat.component';



/** Components associated with combat */
export const COMBAT_EXPORTS = [
  CombatDamage,
  CombatComponent,
  ...COMBAT_PLAYER_COMPONENTS,
  ...COMBAT_ENEMY_COMPONENTS
];

export const COMBAT_PROVIDERS = [
  CanActivateCombat
];

@NgModule({
  declarations: COMBAT_EXPORTS,
  exports: COMBAT_EXPORTS,
  imports: [
    MaterialModule,
    CommonModule,
    BehaviorsModule,
    RPGHealthBarModule
  ]
})
export class CombatModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CombatModule
    };
  }

}
