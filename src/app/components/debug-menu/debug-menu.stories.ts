import { Meta, Story } from '@storybook/angular/types-6-0';
import { DebugMenuComponent } from './debug-menu.component';

export default {
  title: 'RPG/Debug Menu',
  component: DebugMenuComponent,
} as Meta;

interface IPartyMenuInputs {
  open: boolean;
}

const Template: Story<IPartyMenuInputs> = (args: Partial<IPartyMenuInputs>) => ({
  component: DebugMenuComponent,
  props: args,
});

export const Basic = Template.bind({});
Basic.args = {};
