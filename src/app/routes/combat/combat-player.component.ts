import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { SceneObjectBehavior } from '../../behaviors/scene-object-behavior';
import { AnimatedComponent, IAnimationConfig } from '../../components';
import { Point } from '../../core';
import { IPartyMember } from '../../models/base-entity';
import { GameEntityObject } from '../../scene/objects/game-entity-object';
import { Scene } from '../../scene/scene';
import { GameWorld } from '../../services/game-world';
import { Headings } from '../world/behaviors/player-render.behavior';

export enum StateFrames {
  DEFAULT = 10,
  SWING = 1,
  INJURED = 2,
  WALK = 3,
  STRIKE = 3,
  CELEBRATE = 4,
  DEAD = 5,
}

@Component({
  selector: 'combat-player',
  templateUrl: 'combat-player.component.html',
})
export class CombatPlayerComponent
  extends GameEntityObject
  implements AfterViewInit, OnDestroy
{
  @ViewChildren('attack,magic,guard,item,run')
  behaviors: QueryList<SceneObjectBehavior>;
  @ViewChild(AnimatedComponent) animation: AnimatedComponent;
  @Input() model: IPartyMember;
  // @ts-ignore
  @Input() icon: string;
  @Input() scene: Scene | null;
  @Input() combat: any; // CombatComponent - flirts with circular imports

  _elapsed: number = 0;
  state: string = '';
  animating: boolean = false;
  attackDirection: Headings = Headings.WEST;
  tickRateMS: number = 300;

  constructor(public world: GameWorld) {
    super();
  }

  setState(name: string = 'Default') {
    this.state = name;
  }

  async attack(attackCb: () => any) {
    return this._attack(this.getAttackAnimation(attackCb));
  }

  async magic(attackCb: () => any) {
    return this._attack(this.getMagicAnimation(attackCb));
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
    return this.attackDirection === Headings.WEST
      ? [12, 13, 14, 15, 14, 13, 12]
      : [4, 5, 6, 7, 6, 5, 4];
  }

  getMagicAnimation(strikeCb: () => any): IAnimationConfig[] {
    const icon = this.icon || '';
    const moveIcon = icon.replace('.png', '-magic.png');

    return [
      {
        name: 'Prep Animation',
        duration: 50,
        host: this,
        preload: async () => {
          await this.world.preloadSprite(this.icon);
          await this.world.preloadSprite(moveIcon);
        },
        callback: () => {
          this.setSprite(moveIcon, 19);
        },
      },
      {
        name: 'Magic cast',
        host: this,
        repeats: 0,
        duration: 1000,
        frames: [19, 18, 17, 16, 15],
        callback: () => {
          if (strikeCb) {
            strikeCb();
          }
        },
      },
      {
        name: 'Back to rest',
        host: this,
        repeats: 0,
        duration: 1000,
        frames: [15, 16, 17, 18, 19],
        callback: () => {
          this.setSprite(icon, 10);
        },
      },
    ];
  }

  getAttackAnimation(strikeCb: () => any): IAnimationConfig[] {
    const icon = this.icon || '';
    const moveIcon = this.icon.replace('.png', '-attack.png');
    return [
      {
        name: 'Move Forward for Attack',
        host: this,
        repeats: 0,
        duration: 250,
        frames: this.getForwardFrames(),
        move: new Point(this.getForwardDirection(), 0),
        preload: async () => {
          await this.world.preloadSprite(icon);
          await this.world.preloadSprite(moveIcon);
        },

        callback: () => {
          this.setSprite(moveIcon, 12);
        },
      },
      {
        name: 'Strike at Opponent',
        host: this,
        repeats: 1,
        duration: 100,
        frames: this.getAttackFrames(),
        callback: () => {
          this.setSprite(icon, 10);
          if (strikeCb) {
            strikeCb();
          }
        },
      },
      {
        name: 'Return to Party',
        host: this,
        duration: 250,
        repeats: 0,
        frames: this.getBackwardFrames(),
        move: new Point(this.getBackwardDirection(), 0),
      },
    ];
  }

  async moveForward() {
    return this._playAnimation([
      {
        name: 'Move Forward',
        repeats: 0,
        duration: 250,
        frames: this.getForwardFrames(),
        move: new Point(this.getForwardDirection(), 0),
        host: this,
      },
    ]);
  }

  async moveBackward() {
    return this._playAnimation([
      {
        name: 'Move Backward',
        repeats: 0,
        duration: 250,
        frames: this.getBackwardFrames(),
        move: new Point(this.getBackwardDirection(), 0),
        host: this,
      },
    ]);
  }

  private async _playAnimation(animation: IAnimationConfig[]) {
    if (!this.animation || this.animating) {
      return;
    }
    const animations: IAnimationConfig[] = animation.map((anim: IAnimationConfig) => {
      const result = { ...anim };
      if (typeof result.move !== 'undefined') {
        result.move = result.move.clone();
      }
      return result;
    });
    this.animating = true;
    await this.animation.playChain(animations);
    this.animating = false;
  }

  async _attack(attackAnimation: IAnimationConfig[]) {
    if (!this.animation || this.animating) {
      return;
    }
    const animations: IAnimationConfig[] = attackAnimation.map(
      (anim: IAnimationConfig) => {
        const result = { ...anim };
        if (typeof result.move !== 'undefined') {
          result.move = result.move.clone();
        }
        return result;
      },
    );
    this.animating = true;
    await this.animation.playChain(animations);
    this.animating = false;
  }

  interpolateTick(elapsed: number) {
    super.interpolateTick(elapsed);

    if (!this.animating) {
      // Choose frame for interpolated position
      const factor = this._elapsed / this.tickRateMS;
      const altFrame = factor > 0.0 && factor < 0.5;
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
      this.frame = frame;
    }
  }

  ngAfterViewInit(): void {
    this.scene?.addObject(this);
    this.scene?.addObject(this.animation);
    this.behaviors.forEach((c: SceneObjectBehavior) => {
      this.addBehavior(c);
    });
  }

  ngOnDestroy(): void {
    this.scene?.removeObject(this);
    this.scene?.removeObject(this.animation);
    this.behaviors?.forEach((c: SceneObjectBehavior) => {
      this.removeBehavior(c);
    });
    this.destroy();
  }
}
