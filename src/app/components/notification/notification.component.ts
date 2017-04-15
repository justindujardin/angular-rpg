/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import {Component, ElementRef} from '@angular/core';
import {NotificationService} from '../../services/index';
import {LoadingService} from '../loading/loading.service';

@Component({
  selector: 'rpg-notification',
  styleUrls: ['./notification.component.scss'],
  template: `<span class="message" 
      [innerText]="notify.message" 
      [class.loading]="loadingService.loading$ | async">
</span>`,
})
export class RPGNotificationComponent {
  constructor(public notify: NotificationService,
              public loadingService: LoadingService,
              private element: ElementRef) {
    notify.container = element.nativeElement;
  }
}
