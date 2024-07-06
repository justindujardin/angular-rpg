// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { AfterViewInit, Component, Input } from '@angular/core';
import { moduleMetadata } from '@storybook/angular';
import { Meta, StoryFn } from '@storybook/angular';
import { CombatantTypes } from '../../models/base-entity';
import { LoadingService } from './loading.service';

interface ILoadingWrapperProps {
  title: string;
  message: string;
}

@Component({
  selector: 'loading-story-wrapper',
  template: `
    <button mat-button color="primary" (click)="toggleVisible()">Toggle Loading</button>
    <loading></loading>
  `,
})
class LoadingStoryWrapper implements AfterViewInit {
  @Input() cfg: ILoadingWrapperProps;
  constructor(public loadingService: LoadingService) {}
  ngAfterViewInit(): void {
    this.loadingService.title = this.cfg.title;
    this.loadingService.message = this.cfg.message;
    this.loadingService.loading = true;
  }

  toggleVisible() {
    this.loadingService.loading = !this.loadingService.loading;
  }
}

export default {
  title: 'RPG/Loading Overlay',
  template: `<loading-story-wrapper cfg="cfg"></loading-story-wrapper>`,
  decorators: [
    moduleMetadata({
      declarations: [LoadingStoryWrapper],
    }),
  ],
} as Meta;

const Template: StoryFn<CombatantTypes> = (args: Partial<any>) => ({
  component: LoadingStoryWrapper,
  props: {
    cfg: {
      title: 'AngularRPG',
      message: 'Loaded storybook. Looks like a nice read...',
    },
    ...args,
  },
});

export const Loading = Template.bind({});
Loading.args = {};
