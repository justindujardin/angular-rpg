import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AnimatedBehaviorComponent} from './animated.behavior';

export * from './animated.behavior';

/** Common behavior components */
export const BEHAVIOR_COMPONENTS = [
  AnimatedBehaviorComponent
];

@NgModule({
  declarations: BEHAVIOR_COMPONENTS,
  exports: BEHAVIOR_COMPONENTS,
  imports: [
    CommonModule
  ]
})
export class BehaviorsModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: BehaviorsModule
    };
  }

}
