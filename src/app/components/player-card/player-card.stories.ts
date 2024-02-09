import { Meta, StoryFn } from '@storybook/angular';
import { CombatantTypes } from '../../models/base-entity';
import { Warrior } from '../../models/mechanics.mock';
import { PlayerCardComponent } from './player-card.component';

export default {
  title: 'RPG/Player Card',
  component: PlayerCardComponent,
} as Meta;

const Template: StoryFn<CombatantTypes> = (args: Partial<CombatantTypes>) => ({
  component: PlayerCardComponent,
  props: {
    model: {
      ...new Warrior(),
      ...args,
    },
  },
});

export const PlayerCard = Template.bind({});
PlayerCard.args = {
  hp: 10,
  maxhp: 10,
};
