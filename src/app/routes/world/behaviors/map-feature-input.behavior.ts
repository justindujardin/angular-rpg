
import { Component, Input } from '@angular/core';
import * as _ from 'underscore';
import { Rect } from '../../../../app/core/rect';
import { TickedBehavior } from '../../../behaviors/ticked-behavior';
import { NamedMouseElement } from '../../../core/input';
import { GameFeatureObject } from '../../../scene/objects/game-feature-object';
import { Scene } from '../../../scene/scene';
import { TileObject } from '../../../scene/tile-object';

@Component({
  selector: 'map-feature-input-behavior',
  template: `<ng-content></ng-content>`,
})
export class MapFeatureInputBehaviorComponent extends TickedBehavior {
  hitBox: Rect = new Rect(0, 0, 1, 1);
  hits: TileObject[] = [];
  mouse: NamedMouseElement | null = null;

  @Input() scene: Scene;

  syncBehavior(): boolean {
    if (!super.syncBehavior() || !this.host?.scene?.world?.input) {
      return false;
    }
    this.mouse = this.host.scene.world.input.getMouseHook('world');
    return !!this.mouse;
  }

  tick(elapsed: number) {
    // Calculate hits in Scene for machine usage.
    if (!this.host?.scene || !this.mouse) {
      return;
    }
    _.each(this.hits, (tile: TileObject) => {
      tile.scale = 1;
    });

    // Quick array clear
    this.hits.length = 0;

    this.hitBox.point.set(this.mouse.world);
    this.host.scene.db.queryRect(this.hitBox, GameFeatureObject, this.hits);

    _.each(this.hits, (obj: any) => {
      obj.scale = 1.25;
    });
    super.tick(elapsed);
  }
}
