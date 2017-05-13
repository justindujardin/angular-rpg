import * as _ from 'underscore';
import {Component} from '@angular/core';
import {TickedBehavior} from '../../../../game/pow2/scene/behaviors/ticked-behavior';
import {Headings} from '../../world/behaviors/player-render.behavior';
import {AnimatedBehaviorComponent, IAnimationConfig} from '../../../behaviors/animated.behavior';
import {Point} from '../../../../game/pow-core/point';
import {CombatService} from '../../../models/combat/combat.service';
import {GameEntityObject} from '../../../scene/game-entity-object';
export enum StateFrames {
  DEFAULT = 10,
  SWING = 1,
  INJURED = 2,
  WALK = 3,
  STRIKE = 3,
  CELEBRATE = 4,
  DEAD = 5
}

@Component({
  selector: 'combat-player-render-behavior',
  template: `<ng-content></ng-content>`
})
export class CombatPlayerRenderBehaviorComponent extends TickedBehavior {
  _elapsed: number = 0;
  private _renderFrame: number = 3;
  state: string = '';
  animating: boolean = false;
  animator: AnimatedBehaviorComponent = null;
  attackDirection: Headings = Headings.WEST;
  host: GameEntityObject;

  constructor(private combatService: CombatService) {
    super();
  }

  syncBehavior(): boolean {
    this.animator = this.host.findBehavior(AnimatedBehaviorComponent) as AnimatedBehaviorComponent;
    return super.syncBehavior();
  }

  setState(name: string = 'Default') {
    this.state = name;
  }

  attack(attackCb: () => any, cb?: () => void) {
    this._attack(cb, this.getAttackAnimation(attackCb));
  }

  magic(attackCb: () => any, cb?: () => void) {
    this._attack(cb, this.getMagicAnimation(attackCb));
  }

  getForwardDirection(): number {
    return this.attackDirection === Headings.WEST ? -1 : 1;
  }

  getBackwardDirection(): number {
    return this.attackDirection === Headings.WEST ? 1 : -1;
  }

  getForwardFrames(): number[] {
    return this.attackDirection === Headings.WEST ? [9, 11, 10] : [3, 5, 4];
  }

  getBackwardFrames(): number[] {
    return this.attackDirection === Headings.WEST ? [10, 11, 9] : [4, 5, 3];
  }

  getAttackFrames(): number[] {
    return this.attackDirection === Headings.WEST ? [12, 13, 14, 15, 14, 13, 12] : [4, 5, 6, 7, 6, 5, 4];
  }

  getMagicAnimation(strikeCb: () => any) {
    return [
      {
        name: 'Prep Animation',
        callback: () => {
          this.host.setSprite(this.host.icon.replace('.png', '-magic.png'), 19);
        }
      },
      {
        name: 'Magic cast',
        repeats: 0,
        duration: 1000,
        frames: [19, 18, 17, 16, 15],
        callback: () => {
          if (strikeCb) {
            strikeCb();
          }
        }
      },
      {
        name: 'Back to rest',
        repeats: 0,
        duration: 1000,
        frames: [15, 16, 17, 18, 19],
        callback: () => {
          this.host.setSprite(this.host.icon.replace('-magic.png', '.png'), 10);
        }
      }

    ];
  }

  getAttackAnimation(strikeCb: () => any) {
    return [
      {
        name: 'Move Forward for Attack',
        repeats: 0,
        duration: 250,
        frames: this.getForwardFrames(),
        move: new Point(this.getForwardDirection(), 0),
        callback: () => {
          const attackAnimationsSource = this.host.icon.replace('.png', '-attack.png');
          if (this.host.world.sprites.getSpriteMeta(attackAnimationsSource)) {
            this.host.setSprite(attackAnimationsSource, 12);
          }
        }
      },
      {
        name: 'Strike at Opponent',
        repeats: 1,
        duration: 100,
        frames: this.getAttackFrames(),
        callback: () => {
          this.host.setSprite(this.host.icon.replace('-attack.png', '.png'), 10);
          if (strikeCb) {
            strikeCb();
          }
        }
      },
      {
        name: 'Return to Party',
        duration: 250,
        repeats: 0,
        frames: this.getBackwardFrames(),
        move: new Point(this.getBackwardDirection(), 0)
      }
    ];
  }

  moveForward(then?: () => any) {
    this._playAnimation([{
      name: 'Move Forward',
      repeats: 0,
      duration: 250,
      frames: this.getForwardFrames(),
      move: new Point(this.getForwardDirection(), 0)
    }], then);
  }

  moveBackward(then?: () => any) {
    this._playAnimation([{
      name: 'Move Backward',
      repeats: 0,
      duration: 250,
      frames: this.getBackwardFrames(),
      move: new Point(this.getBackwardDirection(), 0)
    }], then);
  }

  _playAnimation(animation: IAnimationConfig[], then: () => any) {
    if (!this.animator || this.animating) {
      return;
    }
    const animations: IAnimationConfig[] = _.map(animation, (anim: IAnimationConfig) => {
      const result = _.extend({}, anim);
      if (typeof result.move !== 'undefined') {
        result.move = result.move.clone();
      }
      return result;
    });
    this.animating = true;
    this.animator.playChain(animations, () => {
      this.animating = false;
      if (then) {
        then();
      }
    });
  }

  _attack(cb: () => void, attackAnimation: any) {
    if (!this.animator || this.animating) {
      return;
    }
    const animations: IAnimationConfig[] = _.map(attackAnimation, (anim: IAnimationConfig) => {
      const result = _.extend({}, anim);
      if (typeof result.move !== 'undefined') {
        result.move = result.move.clone();
      }
      return result;
    });
    this.animating = true;
    this.animator.playChain(animations, () => {
      this.animating = false;
      if (cb) {
        cb();
      }
    });
  }

  interpolateTick(elapsed: number) {
    super.interpolateTick(elapsed);

    if (!this.animating) {

      // Choose frame for interpolated position
      const factor = this._elapsed / this.tickRateMS;
      const altFrame = (factor > 0.0 && factor < 0.5);
      let frame = StateFrames.DEFAULT;
      switch (this.state) {
        case 'Injured':
          frame = StateFrames.DEFAULT;
          break;
        case 'Dead':
          frame = StateFrames.DEFAULT;
          break;
        case 'Attacking':
          frame = altFrame ? StateFrames.STRIKE : StateFrames.SWING;
          break;
        default:
        // Do nothing
      }
      this.host.frame = this._renderFrame = frame;
    }
  }
}
