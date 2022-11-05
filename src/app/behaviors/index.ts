import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CollisionBehaviorComponent } from './collision.behavior';
import { SpriteRenderBehaviorComponent } from './sprite-render.behavior';

/** Common behavior behaviors */
export const BEHAVIOR_COMPONENTS = [
  CollisionBehaviorComponent,
  SpriteRenderBehaviorComponent,
];

@NgModule({
  declarations: BEHAVIOR_COMPONENTS,
  exports: BEHAVIOR_COMPONENTS,
  imports: [CommonModule],
})
export class BehaviorsModule {
  static forRoot(): ModuleWithProviders<BehaviorsModule> {
    return {
      ngModule: BehaviorsModule,
    };
  }
}
