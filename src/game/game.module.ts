import {NgModule, ModuleWithProviders} from '@angular/core';
import {PowCoreModule} from './pow-core/index';

@NgModule({
  exports: [
    PowCoreModule
  ]
})
export class GameModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GameModule
    };
  }
}
