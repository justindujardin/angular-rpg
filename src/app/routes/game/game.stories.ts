import { Component } from '@angular/core';
import { moduleMetadata } from '@storybook/angular';
import { Meta, Story } from '@storybook/angular/types-6-0';
import { GameComponent } from './game.component';

@Component({
  selector: 'game-story-wrapper',
  template: `<loading></loading><game></game>`,
})
class GameStoryWrapper {}
export default {
  title: 'RPG/Game Component',
  component: GameStoryWrapper,
  decorators: [moduleMetadata({ declarations: [GameStoryWrapper, GameComponent] })],
} as Meta;

const Template: Story<any> = (args: Partial<any>) => ({
  component: GameStoryWrapper,
  props: args,
});

export const Basic = Template.bind({});
Basic.args = {};
