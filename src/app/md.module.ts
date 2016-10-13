/* This module is an example how you can package all services and components
 from Angular2-Material into one Angular2 module, which you can import in other modules
 */
import { NgModule, ModuleWithProviders }      from '@angular/core';

import { MdButtonModule }                     from '@angular/material/button';
import { MdCardModule }                       from '@angular/material/card';
import { MdCheckboxModule }                   from '@angular/material/checkbox';
import { MdIconModule }                       from '@angular/material/icon';
import { MdInputModule }                      from '@angular/material/input';
import { MdListModule }                       from '@angular/material/list';
import { MdSidenavModule }                    from '@angular/material/sidenav';
import { MdTabsModule }                       from '@angular/material/tabs';
import { MdToolbarModule }                    from '@angular/material/toolbar';
import { MdTooltipModule }                    from '@angular/material/tooltip';
import { MdProgressBarModule }                from '@angular/material/progress-bar';

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
