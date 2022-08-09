import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { PowCoreModule } from '../game/pow-core';
import { AppRoutingModule } from './app-routing.module';
import { AppEffects } from './app.effects';
import { ROUTES } from './app.routes';
import { BehaviorsModule } from './behaviors';
import { AppComponentsModule } from './components';
import { metaReducers, reducers } from './models';
import { CombatEffects } from './models/combat/combat.effects';
import { GameStateEffects } from './models/game-state/game-state.effects';
import { SpritesEffects } from './models/sprites/sprites.effects';
import { CombatModule } from './routes/combat';
import { WorldModule } from './routes/world';
import { ServicesModule } from './services';

const storeDevtools = [];
if (environment.useDevTools) {
  // TODO: store/devtools disabled because of poor performance.
  //
  // Because devtools serializes state to JSON, if you have a large amount of data in your stores (~500 objects)
  // the time it takes to serialize and deserialize the object becomes significant. This is crippling to the
  // performance of the app.
  //
  // To re-enable the devtools, [fix this](https://github.com/ngrx/store-devtools/issues/57) and then pass
  // the option to use [Immutable compatible devtools](https://goo.gl/Wym3eT).
  //
  // StoreDevtoolsModule.instrumentStore(),
  // Instrumentation must be imported after importing StoreModule (config is optional)
  storeDevtools.push([
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
    }),
  ]);
}

export const APP_IMPORTS = [
  BrowserModule,
  AppRoutingModule,
  BrowserAnimationsModule,
  StoreModule.forRoot(reducers, { metaReducers }),
  BrowserModule,
  CommonModule,
  FormsModule,
  HttpClientModule,

  // Components
  ServicesModule.forRoot(),
  BehaviorsModule.forRoot(),
  AppComponentsModule.forRoot(),

  // Routes
  CombatModule.forRoot(),
  WorldModule.forRoot(),
  PowCoreModule.forRoot(),
  ReactiveFormsModule,
  RouterModule.forRoot(ROUTES, { useHash: true, relativeLinkResolution: 'legacy' }),
  StoreRouterConnectingModule.forRoot(),
  ...storeDevtools,
  EffectsModule.forRoot([GameStateEffects, CombatEffects, SpritesEffects, AppEffects]),
];
