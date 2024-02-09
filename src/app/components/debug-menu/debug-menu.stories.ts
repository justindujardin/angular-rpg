import { Meta, StoryFn } from '@storybook/angular';
import { DebugMenuComponent } from './debug-menu.component';

export default {
  title: 'RPG/Debug Menu',
  component: DebugMenuComponent,
} as Meta;

interface IPartyMenuInputs {
  open: boolean;
}

const Template: StoryFn<IPartyMenuInputs> = (args: Partial<IPartyMenuInputs>) => ({
  component: DebugMenuComponent,
  props: args,
});

export const Basic = Template.bind({});
Basic.args = {};
