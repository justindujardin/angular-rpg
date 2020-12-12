import { Component, Input, ViewChild } from '@angular/core';
import { moduleMetadata } from '@storybook/angular';
import { Meta, Story } from '@storybook/angular/types-6-0';
import { Point } from '../../../game/pow-core';
import { CombatDamageComponent, ICombatDamageInputs } from './combat-damage.component';
/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface IDamageListItem {
  expired?: boolean;
  value: number;
  classes: { [key: string]: boolean };
  position: Point;
}

@Component({
  selector: 'damage-wrapper',
  template: `
    <button mat-button color="accent" (click)="applyDamage()">Damage</button>
    <combat-damage
      *ngFor="let d of damages"
      [value]="d.value"
      [position]="d.position"
      [classes]="d.classes"
      (onHide)="expireDamage(d)"
    ></combat-damage>
  `,
})
class DamageStoryWrapper {
  @Input() damages: IDamageListItem[] = [];
  @ViewChild(CombatDamageComponent) damageComponent: CombatDamageComponent;

  expireDamage(damage: IDamageListItem) {
    damage.expired = true;
    this.damages = this.damages.filter((d) => !d.expired);
  }
  applyDamage() {
    const value = getRandomInt(-10, 10);
    const screenPos: Point = new Point(getRandomInt(20, 400), getRandomInt(20, 80));
    this.damages.push({
      value: Math.abs(value),
      classes: {
        miss: value === 0,
        heal: value < 0,
      },
      position: screenPos,
    });
  }
}

export default {
  title: 'Combat/Damage Component',
  component: DamageStoryWrapper,
  decorators: [moduleMetadata({ declarations: [DamageStoryWrapper] })],
} as Meta;

const Template: Story<ICombatDamageInputs> = (args: Partial<ICombatDamageInputs>) => ({
  component: DamageStoryWrapper,
  props: args,
});

export const Basic = Template.bind({});
Basic.args = {};
