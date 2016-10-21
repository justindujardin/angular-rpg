import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {MaterialModule} from '@angular/material';
import {RouterStoreModule} from '@ngrx/router-store';
import {StoreModule} from '@ngrx/store';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {PowCoreModule} from '../game/pow-core/index';
import {GameModule} from '../game/game.module';
import {ROUTES} from './app.routes';
import {rootReducer} from './models/index';
import {PartyModule} from './components/party/index';
import {CombatModule} from './routes/combat/index';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {GameStateEffects} from './models/game-state/game-state.effects';
import {EffectsModule} from '@ngrx/effects';
import {AppEffects} from './app.effects';
import {WorldModule, WorldEffects} from './routes/world';
import {RPGHealthBarModule} from './components/health-bar';
import {RPGNotificationModule} from './components/notification';
import {RPGSpriteModule} from './components/sprite';

export const APP_IMPORTS = [
  BrowserModule,
  CommonModule,
  FormsModule,
  HttpModule,

  // Components
  PartyModule.forRoot(),
  RPGHealthBarModule.forRoot(),
  RPGNotificationModule.forRoot(),
  RPGSpriteModule.forRoot(),
  // Routes
  CombatModule.forRoot(),
  WorldModule.forRoot(),

  MaterialModule.forRoot(),
  PowCoreModule.forRoot(),
  GameModule.forRoot(),
  MaterialModule.forRoot(),
  ReactiveFormsModule,
  RouterModule.forRoot(ROUTES, {useHash: true}),
  StoreModule.provideStore(rootReducer),
  RouterStoreModule.connectRouter(),
  StoreDevtoolsModule.instrumentOnlyWithExtension(),
  EffectsModule.run(GameStateEffects),
  EffectsModule.run(WorldEffects),
  EffectsModule.run(AppEffects)
];
