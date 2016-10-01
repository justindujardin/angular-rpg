/* This module is an example how you can package all services and components
 from Angular2-Material into one Angular2 module, which you can import in other modules
 */
import { NgModule, ModuleWithProviders }      from '@angular/core';

import { MdButtonModule }                     from '@angular2-material/button';
import { MdCardModule }                       from '@angular2-material/card';
import { MdCheckboxModule }                   from '@angular2-material/checkbox';
import { MdIconModule }                       from '@angular2-material/icon';
import { MdInputModule }                      from '@angular2-material/input';
import { MdListModule }                       from '@angular2-material/list';
import { MdSidenavModule }                    from '@angular2-material/sidenav';
import { MdTabsModule }                       from '@angular2-material/tabs';
import { MdToolbarModule }                    from '@angular2-material/toolbar';
import { MdTooltipModule }                    from '@angular2-material/tooltip';
import { MdProgressBarModule }                from '@angular2-material/progress-bar';

@NgModule({

  exports: [
    MdButtonModule,
    MdCardModule,
    MdCheckboxModule,
    MdIconModule,
    MdInputModule,
    MdListModule,
    MdSidenavModule,
    MdTabsModule,
    MdToolbarModule,
    MdTooltipModule,
    MdProgressBarModule
  ]
})

export class MdModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdModule
    };
  }
}
