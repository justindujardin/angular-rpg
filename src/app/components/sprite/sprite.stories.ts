import { Meta, Story } from '@storybook/angular/types-6-0';
import { RPGSpriteComponent } from './sprite.component';

export default {
  title: 'RPG/Sprite',
  component: RPGSpriteComponent,
} as Meta;

interface ISpriteInputs {
  width: number;
  height: number;
  frame: number;
  name: string;
}

const Template: Story<ISpriteInputs> = (args: Partial<ISpriteInputs>) => ({
  component: RPGSpriteComponent,
  props: args,
});

export const Basic = Template.bind({});
Basic.args = {
  name: 'chest.png',
  width: 64,
  height: 64,
  frame: 0,
};
