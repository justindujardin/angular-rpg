import { CommonModule } from "@angular/common";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { setCompodocJson } from "@storybook/addon-docs/angular";
import { moduleMetadata } from "@storybook/angular";
import { AppEffects } from "../src/app/app.effects";
import { BehaviorsModule } from "../src/app/behaviors";
import { AppComponentsModule } from "../src/app/components";
import { metaReducers, reducers } from "../src/app/models";
import { CombatEffects } from "../src/app/models/combat/combat.effects";
import { GameStateEffects } from "../src/app/models/game-state/game-state.effects";
import { SpritesEffects } from "../src/app/models/sprites/sprites.effects";
import { ServicesModule } from "../src/app/services";
import { CombatModule } from "../src/app/routes/combat";
import { WorldModule } from "../src/app/routes/world";
import docJson from "../src/documentation.json";
import { PowCoreModule } from "../src/game/pow-core";
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatGridListModule } from "@angular/material/grid-list";

export const APP_IMPORTS = [
  StoreModule.forRoot(reducers, { metaReducers }),
  CommonModule,
  //   RouterModule.forRoot(),

  // Components
  ServicesModule.forRoot(),
  BehaviorsModule.forRoot(),
  AppComponentsModule.forRoot(),

  MatButtonModule,
  MatGridListModule,

  // Routes
  CombatModule.forRoot(),
  WorldModule.forRoot(),
  PowCoreModule.forRoot(),
  EffectsModule.forRoot([
    GameStateEffects,
    // CombatEffects,
    SpritesEffects,
    // AppEffects,
  ]),
];

setCompodocJson(docJson);

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};
export const decorators = [moduleMetadata({ imports: APP_IMPORTS })];
