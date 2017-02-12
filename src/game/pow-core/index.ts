import {NgModule, ModuleWithProviders} from '@angular/core';
import {ResourceLoader} from './resourceLoader';
import {HttpModule} from '@angular/http';
import {CommonModule} from '@angular/common';

export * from './behavior';
export * from './entity';
export * from './errors';
export * from './point';
export * from './rect';
export * from './resource';
export * from './resourceLoader';
export * from './time';
export * from './world';
export * from './resources/audio';
export * from './resources/entities';
export * from './resources/image';
export * from './resources/json';
export * from './resources/script';
export * from './resources/xml';
export * from './resources/tiled/tiled';
export * from './resources/tiled/tiledTmx';
export * from './resources/tiled/tiledTsx';

export const POW_CORE_PROVIDERS = [
  ResourceLoader
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
