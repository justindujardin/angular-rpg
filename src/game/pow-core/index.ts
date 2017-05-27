import {NgModule, ModuleWithProviders} from '@angular/core';
import {ResourceManager} from './resource-manager';
import {HttpModule} from '@angular/http';
import {CommonModule} from '@angular/common';

export * from './behavior';
export * from './behavior-host';
export * from './errors';
export * from './point';
export * from './rect';
export * from './resource';
export * from './resource-manager';
export * from './time';
export * from './world';
export * from './resources/audio.resource';
export * from './resources/image.resource';
export * from './resources/json.resource';
export * from './resources/xml.resource';
export * from './resources/tiled/tiled';
export * from './resources/tiled/tiled-tmx.resource';
export * from './resources/tiled/tiled-tsx.resource';

export const POW_CORE_PROVIDERS = [
  ResourceManager
];

@NgModule({
  providers: POW_CORE_PROVIDERS,
  imports: [
    HttpModule,
    CommonModule
  ]
})
export class PowCoreModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PowCoreModule,
      providers: POW_CORE_PROVIDERS
    };
  }

}
