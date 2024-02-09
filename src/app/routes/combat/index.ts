
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { BehaviorsModule } from '../../behaviors/index';
import { AppComponentsModule } from '../../components/index';
import { ServicesModule } from '../../services';
import {
  CombatAttackBehaviorComponent,
  CombatGuardBehavior,
  CombatItemBehavior,
  CombatMagicBehavior,
  CombatRunBehaviorComponent,
} from './behaviors/actions';
import { CombatDamageComponent } from './combat-damage.component';
import { CombatEnemyComponent } from './combat-enemy.component';
import { CombatHUDComponent } from './combat-hud.component';
import { CombatPlayerComponent } from './combat-player.component';
import { CombatComponent } from './combat.component';
import { CanActivateCombat } from './combat.guards';
import { COMBAT_STATE_COMPONENTS } from './states/index';

export * from './combat-damage.component';
export * from './combat.component';

/** Components associated with combat map */
export const COMBAT_MAP_COMPONENTS = [CombatHUDComponent];

/** Components associated with combat player */
export const COMBAT_PLAYER_COMPONENTS = [
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
  providers: COMBAT_PROVIDERS,
  imports: [CommonModule, BehaviorsModule, AppComponentsModule, ServicesModule],
})
export class CombatModule {
  static forRoot(): ModuleWithProviders<CombatModule> {
    return {
      ngModule: CombatModule,
    };
  }
}
