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
import {Animate} from './animate';
import {RPGGame} from './rpg-game';
import {GameWorld} from './game-world';
import {NgModule, ModuleWithProviders} from '@angular/core';
import {PowCoreModule} from '../../game/pow-core/index';
import {SpriteRender} from './sprite-render';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {Visibility} from './visibility';
import {GameStateService} from '../models/game-state/game-state.service';
import {CombatService} from '../models/combat/combat.service';
import {NotificationService} from '../components/notification/notification.service';
import {GameDataService} from '../models/game-data/game-data.service';
import {SpritesService} from '../models/sprites/sprites.service';
export * from './animate';
export * from '../components/notification/notification.service';
export * from './rpg-game';

export const SERVICE_PROVIDERS = [
  Animate,
  RPGGame,
  GameWorld,
  SpriteRender,
  Visibility,
  NotificationService,
  CombatService,
  SpritesService,
  GameDataService,
  GameStateService
];

@NgModule({
  providers: SERVICE_PROVIDERS,
  imports: [PowCoreModule, StoreModule, EffectsModule]
})
export class ServicesModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ServicesModule,
      providers: SERVICE_PROVIDERS
    };
  }

}
