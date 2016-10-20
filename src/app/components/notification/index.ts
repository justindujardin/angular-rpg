import {NgModule, ModuleWithProviders} from '@angular/core';
import {RPGNotification} from './notification.component';

export * from './notification.component';

const NOTIFICATION_EXPORTS = [
  RPGNotification
];

@NgModule({
  declarations: NOTIFICATION_EXPORTS,
  exports: NOTIFICATION_EXPORTS,
  imports: []
})
export class RPGNotificationModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: RPGNotificationModule
    };
  }

}
