import { Component, Input } from '@angular/core';
import { CombatantTypes } from '../../models/base-entity';

/**
 * Render a linear progress bar to represent an Entity's health
 */
@Component({
  selector: 'rpg-health-bar',
  styleUrls: ['./health-bar.component.scss'],
  template: ` <div
    [ngClass]="_getCSSClassMap()"
    [style.width]="_getProgressBarWidth() + '%'"
  >
    <ng-content></ng-content>
  </div>`,
})
export class RPGHealthBarComponent {
  @Input()
  model: CombatantTypes;

  _getCSSClassMap(): { [className: string]: boolean } {
    if (!this.model) {
      return {};
    }
    const pct: number = Math.round((this.model.hp / this.model.maxhp) * 100);
    return {
      dead: pct === 0,
      critical: pct < 33,
      hurt: pct < 66,
      fine: pct > 66,
    };
  }

  _getProgressBarWidth(): number {
    let width = 0;
    if (this.model && this.model) {
      width = Math.ceil((this.model.hp / this.model.maxhp) * 100);
    }
    return width;
  }
}
