import { AfterViewInit, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { moduleMetadata } from '@storybook/angular';
import { Meta, StoryFn } from '@storybook/angular';
import { AppState } from 'app/app.model';
import { LoadingService } from '../loading';

interface ISpriteInputs {
  width: number;
  height: number;
  frame: number;
  name: string;
}

@Component({
  selector: 'sprite-story-wrapper',
  template: `<rpg-sprite [width]="width" [height]="height" [name]="name"></rpg-sprite>`,
})
class Wrapper implements AfterViewInit {
  constructor(
    public store: Store<AppState>,
    public loadingService: LoadingService,
  ) {}
  @Input() width: number;
  @Input() height: number;
  @Input() name: string;
  @Input() frame: number = 0;
  ngAfterViewInit(): void {}
}

const Template: StoryFn<ISpriteInputs> = (args: Partial<ISpriteInputs>) => ({
  component: Wrapper,
  props: args,
});

export default {
  title: 'RPG/Sprite',
  component: Wrapper,
  decorators: [
    moduleMetadata({
      declarations: [Wrapper],
    }),
  ],
} as Meta;

export const Basic = Template.bind({});
Basic.args = {
  name: 'chest.png',
  width: 64,
  height: 64,
  frame: 0,
};
