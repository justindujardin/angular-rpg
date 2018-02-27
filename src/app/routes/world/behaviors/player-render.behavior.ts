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
import {TickedBehavior} from '../../../../game/pow2/scene/behaviors/ticked-behavior';
import {TileObject} from '../../../../game/pow2/tile/tile-object';
import {Animator} from '../../../../game/pow2/core/animator';
import {Component} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
export enum MoveFrames {
  LEFT = 10,
  RIGHT = 4,
  DOWN = 7,
  UP = 1,
  LEFTALT = 11,
  RIGHTALT = 5,
  DOWNALT = 8,
  UPALT = 2
}

// The order here maps to the first four frames in MoveFrames above.
// It matters, don't change without care.
export enum Headings {
  WEST = 0,
  EAST = 1,
  SOUTH = 2,
  NORTH = 3
}

@Component({
  selector: 'player-render-behavior',
  template: `
    <ng-content></ng-content>`
})
export class PlayerRenderBehaviorComponent extends TickedBehavior {
  host: TileObject;
  private _animator: Animator = new Animator();
  heading: Headings = Headings.WEST;
  animating: boolean = false;
  private _sourceAnimsFor: string = '';

  private _changeSubscription: Subscription;

  connectBehavior(): boolean {
    if (!super.connectBehavior()) {
      return false;
    }

    // When the host icon changes, invalidate source animation data
    this._changeSubscription = this.host.onChangeIcon.subscribe(() => {
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
    if (!this._animator.sourceAnims || this._sourceAnimsFor !== this.host.icon) {
      this._animator.setAnimationSource(this.host.icon);
      this._sourceAnimsFor = this.host.icon;
    }
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
    if (this.animating) {
      this._animator.updateTime(elapsed);
    }
    this.host.frame = this._animator.getFrame();
  }
}
