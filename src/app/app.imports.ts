import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {RouterStoreModule} from '@ngrx/router-store';
import {StoreModule} from '@ngrx/store';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {PowCoreModule} from '../game/pow-core/index';
import {GameModule} from '../game/game.module';
import {ROUTES} from './app.routes';
import {rootReducer} from './models/index';
import {CombatModule} from './routes/combat/index';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {GameStateEffects} from './models/game-state/game-state.effects';
import {EffectsModule} from '@ngrx/effects';
import {AppEffects} from './app.effects';
import {WorldModule} from './routes/world';
import {BehaviorsModule} from './behaviors/index';
import {CombatEffects} from './models/combat/combat.effects';
import {AppComponentsModule} from './components/index';

export const APP_IMPORTS = [
  BrowserModule,
  CommonModule,
  FormsModule,
  HttpModule,

  // Components
  BehaviorsModule.forRoot(),
  AppComponentsModule.forRoot(),

  // Routes
  CombatModule.forRoot(),
  WorldModule.forRoot(),
  PowCoreModule.forRoot(),
  GameModule.forRoot(),

  ReactiveFormsModule,
  RouterModule.forRoot(ROUTES, {useHash: true}),
  StoreModule.provideStore(rootReducer),
  RouterStoreModule.connectRouter(),
  StoreDevtoolsModule.instrumentOnlyWithExtension(),
  EffectsModule.run(GameStateEffects),
  EffectsModule.run(CombatEffects),
  EffectsModule.run(AppEffects)
];
