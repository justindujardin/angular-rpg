import {NgModule, ModuleWithProviders} from '@angular/core';
import {RPGHealthBar} from './health-bar.component';
import {MaterialModule} from '@angular/material';
import {CommonModule} from '@angular/common';

export * from './health-bar.component';

const HEALTH_BAR_EXPORTS = [
  RPGHealthBar
];

@NgModule({
  declarations: HEALTH_BAR_EXPORTS,
  exports: HEALTH_BAR_EXPORTS,
  imports: [CommonModule, MaterialModule]
})
export class RPGHealthBarModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: RPGHealthBarModule
    };
  }

}
