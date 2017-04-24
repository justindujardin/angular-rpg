import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AnimatedBehaviorComponent} from './animated.behavior';
import {CollisionBehaviorComponent} from './collision.behavior';
import {SpriteRenderBehaviorComponent} from './sprite-render.behavior';

export * from './animated.behavior';

/** Common behavior behaviors */
export const BEHAVIOR_COMPONENTS = [
  AnimatedBehaviorComponent,
  CollisionBehaviorComponent,
  SpriteRenderBehaviorComponent
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
