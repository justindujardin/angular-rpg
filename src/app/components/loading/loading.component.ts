import {Component, ChangeDetectionStrategy} from '@angular/core';
import {LoadingService} from './loading.service';

@Component({
  selector: 'loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="loading fade pt-page-scaleUp" *ngIf="loadingService.loading$ | async">
    <div class="loading-wrapper">
      <div class="loading-wrapper-inner hero-container">
        <h1>
          <a target="_blank" href="https://github.com/justindujardin/angular2-rpg">{{loadingService.title$ | async}}</a>
        </h1>
        <p>{{loadingService.message$ | async}}</p>
      </div>
    </div>
  </div>`
})
export class Loading {
  constructor(public loadingService: LoadingService) {
  }
}
