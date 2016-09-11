/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import {TileObject} from '../../tile/tileObject';
import {TickedComponent} from '../../scene/components/tickedComponent';
import {AnimatedComponent, IAnimationConfig} from './animatedComponent';
import {Point} from '../../../pow-core/point';
import {Headings} from './playerRenderComponent';
export enum StateFrames {
  DEFAULT = 10,
  SWING = 1,
  INJURED = 2,
  WALK = 3,
  STRIKE = 3,
  CELEBRATE = 4,
  DEAD = 5
}
export class PlayerCombatRenderComponent extends TickedComponent {
  host: TileObject;
  _elapsed: number = 0;
  private _renderFrame: number = 3;
  state: string = "";
  animating: boolean = false;
  animator: AnimatedComponent = null;
  attackDirection: Headings = Headings.WEST;

  syncComponent(): boolean {
    this.animator = <AnimatedComponent>this.host.findComponent(AnimatedComponent);
    return super.syncComponent();
  }

  setState(name: string = "Default") {
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


  getMagicAnimation(strikeCb: ()=>any) {
    return [
      {
        name: "Prep Animation",
        callback: () => {
          this.host.setSprite(this.host.icon.replace(".png", "-magic.png"), 19);
        }
      },
      {
        name: "Magic cast",
        repeats: 0,
        duration: 1000,
        frames: [19, 18, 17, 16, 15],
        callback: () => {
          strikeCb && strikeCb();
        }
      },
      {
        name: "Back to rest",
        repeats: 0,
        duration: 1000,
        frames: [15, 16, 17, 18, 19],
        callback: () => {
          this.host.setSprite(this.host.icon.replace("-magic.png", ".png"), 10);
        }
      }

    ];
  }

  getAttackAnimation(strikeCb: ()=>any) {
    return [
      {
        name: "Move Forward for Attack",
        repeats: 0,
        duration: 250,
        frames: this.getForwardFrames(),
        move: new Point(this.getForwardDirection(), 0),
        callback: () => {
          var attackAnimationsSource = this.host.icon.replace(".png", "-attack.png");
          if (this.host.world.sprites.getSpriteMeta(attackAnimationsSource)) {
            this.host.setSprite(attackAnimationsSource, 12);
          }
        }
      },
      {
        name: "Strike at Opponent",
        repeats: 1,
        duration: 100,
        frames: this.getAttackFrames(),
        callback: () => {
          this.host.setSprite(this.host.icon.replace("-attack.png", ".png"), 10);
          strikeCb && strikeCb();
        }
      },
      {
        name: "Return to Party",
        duration: 250,
        repeats: 0,
        frames: this.getBackwardFrames(),
        move: new Point(this.getBackwardDirection(), 0)
      }
    ];
  }

  moveForward(then?: ()=>any) {
    this._playAnimation([{
      name: "Move Forward",
      repeats: 0,
      duration: 250,
      frames: this.getForwardFrames(),
      move: new Point(this.getForwardDirection(), 0)
    }], then);
  }

  moveBackward(then?: ()=>any) {
    this._playAnimation([{
      name: "Move Backward",
      repeats: 0,
      duration: 250,
      frames: this.getBackwardFrames(),
      move: new Point(this.getBackwardDirection(), 0)
    }], then);
  }

  _playAnimation(animation: IAnimationConfig[], then: ()=>any) {
    if (!this.animator || this.animating) {
      return;
    }
    var animations: IAnimationConfig[] = _.map(animation, (anim: IAnimationConfig) => {
      var result = _.extend({}, anim);
      if (typeof result.move !== 'undefined') {
        result.move = result.move.clone();
      }
      return result;
    });
    this.animating = true;
    this.animator.playChain(animations, () => {
      this.animating = false;
      then && then();
    });
  }

  _attack(cb: () => void, attackAnimation: any) {
    if (!this.animator || this.animating) {
      return;
    }
    var animations: IAnimationConfig[] = _.map(attackAnimation, (anim: IAnimationConfig) => {
      var result = _.extend({}, anim);
      if (typeof result.move !== 'undefined') {
        result.move = result.move.clone();
      }
      return result;
    });
    this.animating = true;
    this.animator.playChain(animations, () => {
      this.animating = false;
      cb && cb();
    });
  }

  interpolateTick(elapsed: number) {
    super.interpolateTick(elapsed);

    if (!this.animating) {

      // Choose frame for interpolated position
      var factor = this._elapsed / this.tickRateMS;
      var altFrame = !!((factor > 0.0 && factor < 0.5));
      var frame = StateFrames.DEFAULT;
      switch (this.state) {
        case "Injured":
          frame = StateFrames.DEFAULT;
          break;
        case "Dead":
          frame = StateFrames.DEFAULT;
          break;
        case "Attacking":
          frame = altFrame ? StateFrames.STRIKE : StateFrames.SWING;
          break;
      }
      this.host.frame = this._renderFrame = frame;
    }
  }
}
