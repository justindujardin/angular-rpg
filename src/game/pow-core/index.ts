import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ResourceManager } from './resource-manager';

export * from './behavior';
export * from './behavior-host';
export * from './errors';
export * from './point';
export * from './rect';
export * from './resource';
export * from './resource-manager';
export * from './resources/audio.resource';
export * from './resources/image.resource';
export * from './resources/json.resource';
export * from './resources/tiled/tiled';
export * from './resources/tiled/tiled-tmx.resource';
export * from './resources/tiled/tiled-tsx.resource';
export * from './resources/xml.resource';
export * from './time';
export * from './world';

export const POW_CORE_PROVIDERS = [ResourceManager];

@NgModule({
  providers: POW_CORE_PROVIDERS,
  imports: [HttpClientModule, CommonModule],
})
export class PowCoreModule {
  static forRoot(): ModuleWithProviders<PowCoreModule> {
    return {
      ngModule: PowCoreModule,
      providers: POW_CORE_PROVIDERS,
    };
  }
}
