import { ModuleWithProviders, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { PowCoreModule } from '../../app/core/index';
import { NotificationService } from '../components/notification/notification.service';
import { CombatService } from '../models/combat/combat.service';
import { GameStateService } from '../models/game-state/game-state.service';
import { SpritesService } from '../models/sprites/sprites.service';
import { Animate } from './animate';
import { GameWorld } from './game-world';
import { RPGGame } from './rpg-game';
import { SpriteRender } from './sprite-render';
import { WindowService } from './window';

export const SERVICE_PROVIDERS = [
  Animate,
  RPGGame,
  GameWorld,
  SpriteRender,
  NotificationService,
  CombatService,
  SpritesService,
  GameStateService,
  WindowService,
];

@NgModule({
  providers: SERVICE_PROVIDERS,
  imports: [PowCoreModule, StoreModule, EffectsModule],
})
export class ServicesModule {
  static forRoot(): ModuleWithProviders<ServicesModule> {
    return {
      ngModule: ServicesModule,
      providers: SERVICE_PROVIDERS,
    };
  }
}
