import {NgModule, ModuleWithProviders} from '@angular/core';
import {RPGSprite} from './sprite.component';
import {CommonModule} from '@angular/common';

export * from './sprite.component';

const SPRITE_EXPORTS = [
  RPGSprite
];

@NgModule({
  declarations: SPRITE_EXPORTS,
  exports: SPRITE_EXPORTS,
  imports: [CommonModule]
})
export class RPGSpriteModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: RPGSpriteModule
    };
  }

}
