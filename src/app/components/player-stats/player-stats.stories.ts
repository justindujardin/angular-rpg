import { Meta, StoryFn } from '@storybook/angular';
import { CombatantTypes } from '../../models/base-entity';
import { Warrior } from '../../models/mechanics.mock';
import { PlayerStatsComponent } from './player-stats.component';

export default {
  title: 'RPG/Player Stats',
  component: PlayerStatsComponent,
} as Meta;

const Template: StoryFn<CombatantTypes> = (args: Partial<CombatantTypes>) => ({
  component: PlayerStatsComponent,
  props: {
    model: {
      ...new Warrior(),
      ...args,
    },
  },
});

export const Basic = Template.bind({});
Basic.args = {};
