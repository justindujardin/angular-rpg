/*
 Copyright (C) 2013-2020 by Justin DuJardin and Contributors

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
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { BehaviorsModule } from '../../behaviors/index';
import { AppComponentsModule } from '../../components/index';
import { ServicesModule } from '../../services';
import {
  CombatCameraBehaviorComponent,
  CombatPlayerRenderBehaviorComponent,
} from './behaviors';
import {
  CombatAttackBehaviorComponent,
  CombatGuardBehavior,
  CombatItemBehavior,
  CombatMagicBehavior,
  CombatRunBehaviorComponent,
} from './behaviors/actions';
import { CombatDamageComponent } from './combat-damage.component';
import { CombatEnemyComponent } from './combat-enemy.entity';
import { CombatHUDComponent } from './combat-hud.component';
import { CombatMapComponent } from './combat-map.entity';
import { CombatPlayerComponent } from './combat-player.entity';
import { CombatComponent } from './combat.component';
import { CanActivateCombat } from './combat.guards';
import { COMBAT_STATE_COMPONENTS } from './states/index';

export * from './combat-damage.component';
export * from './combat.component';

/** Components associated with combat map */
export const COMBAT_MAP_COMPONENTS = [
  CombatMapComponent,
  CombatHUDComponent,
  CombatCameraBehaviorComponent,
];

/** Components associated with combat player */
export const COMBAT_PLAYER_COMPONENTS = [
  CombatPlayerRenderBehaviorComponent,
  CombatAttackBehaviorComponent,
  CombatMagicBehavior,
  CombatItemBehavior,
  CombatRunBehaviorComponent,
  CombatGuardBehavior,
  CombatPlayerComponent,
];

/** Components associated with combat enemy */
export const COMBAT_ENEMY_COMPONENTS = [CombatEnemyComponent];

/** Components associated with combat */
export const COMBAT_EXPORTS = [
  CombatDamageComponent,
  CombatComponent,
  ...COMBAT_PLAYER_COMPONENTS,
  ...COMBAT_ENEMY_COMPONENTS,
  ...COMBAT_STATE_COMPONENTS,
  ...COMBAT_MAP_COMPONENTS,
];

export const COMBAT_PROVIDERS = [CanActivateCombat];

@NgModule({
  declarations: COMBAT_EXPORTS,
  exports: COMBAT_EXPORTS,
  imports: [CommonModule, BehaviorsModule, AppComponentsModule, ServicesModule],
})
export class CombatModule {
  static forRoot(): ModuleWithProviders<CombatModule> {
    return {
      ngModule: CombatModule,
    };
  }
}
