import {CombatModule} from './ui/combat/index';
import {NgModule, ModuleWithProviders} from '@angular/core';
import {WorldModule} from './ui/world/index';
import {RpgModule} from './ui/rpg/index';
import {PartyModule} from './ui/party/index';
import {ServicesModule} from './ui/services/index';


@NgModule({
  exports: [
    CombatModule,
    WorldModule,
    RpgModule,
    PartyModule,
    ServicesModule
  ]
})
export class GameModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GameModule
    };
  }
}
