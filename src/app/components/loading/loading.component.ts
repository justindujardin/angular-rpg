import {Component, ChangeDetectionStrategy} from '@angular/core';
import {LoadingService} from './loading.service';

@Component({
  selector: 'loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="loading fade" *ngIf="loadingService.loading$ | async">
    <div class="loading-wrapper">
      <div class="loading-wrapper-inner hero-container">
        <h1>
          <a target="_blank" href="https://github.com/justindujardin/angular-rpg">{{loadingService.title$ | async}}</a>
        </h1>
        <p>{{loadingService.message$ | async}}</p>
      </div>
    </div>
  </div>`
})
export class LoadingComponent {
  constructor(public loadingService: LoadingService) {
  }
}
