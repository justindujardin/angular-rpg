import { Meta, Story } from '@storybook/angular/types-6-0';
import { PartyMenuComponent } from './party-menu.component';

export default {
  title: 'RPG/Party Menu',
  component: PartyMenuComponent,
} as Meta;

interface IPartyMenuInputs {
  open: boolean;
}

const Template: Story<IPartyMenuInputs> = (args: Partial<IPartyMenuInputs>) => ({
  component: PartyMenuComponent,
  props: args,
});

export const Basic = Template.bind({});
Basic.args = {};
