
import { Component, ElementRef } from '@angular/core';
import { LoadingService } from '../loading/loading.service';
import { NotificationService } from './notification.service';

@Component({
  selector: 'rpg-notification',
  styleUrls: ['./notification.component.scss'],
  template: `<span
    class="message"
    [innerText]="notify.message"
    [class.loading]="loadingService.loading$ | async"
  >
  </span>`,
})
export class RPGNotificationComponent {
  constructor(
    public notify: NotificationService,
    public loadingService: LoadingService,
    private element: ElementRef
  ) {
    notify.container = element.nativeElement;
  }
}
