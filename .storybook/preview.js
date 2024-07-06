import { CommonModule } from "@angular/common";
import { provideMockStore } from "@ngrx/store/testing";
import { moduleMetadata } from "@storybook/angular";
import { BehaviorsModule } from "../src/app/behaviors";
import { AppComponentsModule } from "../src/app/components";
import { ServicesModule } from "../src/app/services";
import { CombatModule } from "../src/app/routes/combat";
import { WorldModule } from "../src/app/routes/world";
import { PowCoreModule } from "../src/app/core";
import { MatButtonModule } from "@angular/material/button";
import { MatGridListModule } from "@angular/material/grid-list";

import { setCompodocJson } from "@storybook/addon-docs/angular";
import docJson from "../src/documentation.json";
import { MockProvider, MockProviders } from "ng-mocks";
import { RPGGame } from "../src/app/services/rpg-game";
import { GameStateService } from "../src/app/models/game-state/game-state.service";
import { GameWorld } from "../src/app/services/game-world";

setCompodocJson(docJson);

export const APP_IMPORTS = [
  CommonModule,

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
];

export const APP_PROVIDERS = [
  provideMockStore({}),
  MockProviders(RPGGame, GameStateService, GameWorld),
];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

export const decorators = [
  moduleMetadata({
    imports: APP_IMPORTS,
    providers: APP_PROVIDERS,
  }),
];
