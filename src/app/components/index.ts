import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule as MatButtonModule } from '@angular/material/button';
import { MatCardModule as MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule as MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule as MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RPG_ANIMATED_EXPORTS } from './animated/index';
import { RPG_DEBUG_MENU_EXPORTS, RPG_DEBUG_MENU_IMPORTS } from './debug-menu/index';
import { RPG_HEALTH_BAR_EXPORTS } from './health-bar/index';
import { RPG_LOADING_EXPORTS, RPG_LOADING_PROVIDERS } from './loading/index';
import {
  RPG_NOTIFICATION_EXPORTS,
  RPG_NOTIFICATION_PROVIDERS,
} from './notification/index';
import { RPG_PARTY_INVENTORY_EXPORTS } from './party-inventory/index';
import { RPG_PARTY_MENU_EXPORTS } from './party-menu/index';
import { RPG_PLAYER_CARD_EXPORTS } from './player-card/index';
import { RPG_PLAYER_STATS_EXPORTS } from './player-stats/index';
import { RPG_SPRITE_EXPORTS } from './sprite/index';

export * from './animated/index';
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
  ...RPG_DEBUG_MENU_EXPORTS,
  ...RPG_HEALTH_BAR_EXPORTS,
  ...RPG_LOADING_EXPORTS,
  ...RPG_NOTIFICATION_EXPORTS,
  ...RPG_PARTY_INVENTORY_EXPORTS,
  ...RPG_PARTY_MENU_EXPORTS,
  ...RPG_PLAYER_CARD_EXPORTS,
  ...RPG_PLAYER_STATS_EXPORTS,
  ...RPG_SPRITE_EXPORTS,
  ...RPG_ANIMATED_EXPORTS,
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
    CommonModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatButtonModule,
    ...RPG_DEBUG_MENU_IMPORTS,
  ],
})
export class AppComponentsModule {
  static forRoot(): ModuleWithProviders<AppComponentsModule> {
    return {
      ngModule: AppComponentsModule,
    };
  }
}
