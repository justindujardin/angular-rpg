// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/angular/types-6-0';
import { CombatantTypes } from '../../models/base-entity';
import { Warrior } from '../../models/mechanics.mock';
import { RPGHealthBarComponent } from './health-bar.component';

export default {
  title: 'RPG/Health Bar',
  component: RPGHealthBarComponent,
} as Meta;

const Template: Story<CombatantTypes> = (args: Partial<CombatantTypes>) => ({
  component: RPGHealthBarComponent,
  props: {
    model: {
      ...new Warrior(),
      ...args,
    },
  },
});

export const Healthy = Template.bind({});
Healthy.args = {
  hp: 10,
  maxhp: 10,
};

export const Injured = Template.bind({});
Injured.args = {
  hp: 6,
  maxhp: 10,
};

export const Critical = Template.bind({});
Critical.args = {
  hp: 3,
  maxhp: 10,
};

export const Dead = Template.bind({});
Dead.args = {
  hp: 0,
  maxhp: 10,
};
