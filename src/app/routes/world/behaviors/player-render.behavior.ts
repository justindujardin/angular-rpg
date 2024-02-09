import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { TickedBehavior } from '../../../behaviors/ticked-behavior';
import { Animator } from '../../../core/animator';
import { TileObject } from '../../../scene/tile-object';

export enum MoveFrames {
  LEFT = 10,
  RIGHT = 4,
  DOWN = 7,
  UP = 1,
  LEFTALT = 11,
  RIGHTALT = 5,
  DOWNALT = 8,
  UPALT = 2,
}

// The order here maps to the first four frames in MoveFrames above.
// It matters, don't change without care.
export enum Headings {
  WEST = 0,
  EAST = 1,
  SOUTH = 2,
  NORTH = 3,
}

@Component({
  selector: 'player-render-behavior',
  template: ` <ng-content></ng-content>`,
})
export class PlayerRenderBehaviorComponent extends TickedBehavior {
  host: TileObject;
  private _animator: Animator = new Animator();
  heading: Headings = Headings.WEST;
  animating: boolean = false;
  private _sourceAnimsFor: string = '';

  private _changeSubscription: Subscription | null;

  connectBehavior(): boolean {
    if (!super.connectBehavior()) {
      return false;
    }

    // When the host icon changes, invalidate source animation data
    this._changeSubscription = this.host.onChangeIcon.subscribe(() => {
      const icon = this.host.altIcon || this.host.icon || '';
      if (!this._animator.sourceAnims || this._sourceAnimsFor !== icon) {
        this._animator.setAnimationSource(icon);
      }
      this.setHeading(this.heading, false);
    });
    return true;
  }

  disconnectBehavior(): boolean {
    if (this._changeSubscription) {
      this._changeSubscription.unsubscribe();
      this._changeSubscription = null;
    }
    return super.disconnectBehavior();
  }

  setHeading(direction: Headings, animating: boolean) {
    this.heading = direction;
    switch (this.heading) {
      case Headings.SOUTH:
        this._animator.setAnimation('down');
        break;
      case Headings.NORTH:
        this._animator.setAnimation('up');
        break;
      case Headings.EAST:
        this._animator.setAnimation('right');
        break;
      case Headings.WEST:
        this._animator.setAnimation('left');
        break;
      default:
        console.warn('unsupported heading direction: ' + this.heading);
        break;
    }
    this._animator.updateTime(0);
    this.animating = animating;
  }

  setMoving(moving: boolean) {
    this.animating = moving;
  }

  interpolateTick(elapsed: number) {
    super.interpolateTick(elapsed);
    const icon = this.host.altIcon || this.host.icon || '';
    if (!this._animator.sourceAnims || this._sourceAnimsFor !== icon) {
      this._animator.setAnimationSource(icon);
      this._sourceAnimsFor = icon;
      this._animator.updateTime(elapsed);
    }
    if (this.animating) {
      this._animator.updateTime(elapsed);
    }
    this.host.frame = this._animator.getFrame();
  }
}
