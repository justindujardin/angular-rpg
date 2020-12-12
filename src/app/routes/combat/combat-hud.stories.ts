import { Meta, Story } from '@storybook/angular/types-6-0';
import { CombatHUDComponent } from './combat-hud.component';

export default {
  title: 'Combat/HUD Component',
  component: CombatHUDComponent,
} as Meta;

const Template: Story<any> = (args: Partial<any>) => ({
  component: CombatHUDComponent,
  props: args,
});

export const Basic = Template.bind({});
Basic.args = {};
