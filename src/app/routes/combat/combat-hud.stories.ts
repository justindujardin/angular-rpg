import { Meta, StoryFn } from '@storybook/angular';
import { CombatHUDComponent } from './combat-hud.component';

export default {
  title: 'Combat/HUD Component',
  component: CombatHUDComponent,
} as Meta;

const Template: StoryFn<any> = (args: Partial<any>) => ({
  component: CombatHUDComponent,
  props: args,
});

export const Basic = Template.bind({});
Basic.args = {};
