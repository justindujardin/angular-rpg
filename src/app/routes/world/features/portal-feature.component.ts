
import { Component, Input } from '@angular/core';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { GameStateTravelAction } from '../../../models/game-state/game-state.actions';
import { assertTrue } from '../../../models/util';
import { TileObject } from '../../../scene/tile-object';
import { IMapFeatureProperties, MapFeatureComponent } from '../map-feature.component';

export interface IPortalFeatureProperties extends IMapFeatureProperties {
  target: string;
  targetX: number;
  targetY: number;
}

@Component({
  selector: 'portal-feature',
  template: ` <ng-content></ng-content>`,
})
export class PortalFeatureComponent extends MapFeatureComponent {
  @Input() feature: ITiledObject | null;

  entered(object: TileObject): boolean {
    this.assertFeature();

    assertTrue(this.feature, 'invalid feature');
    const props: IPortalFeatureProperties = this.feature.properties || {};
    if (!props.target) {
      return false;
    }
    this.store.dispatch(
      new GameStateTravelAction({
        location: props.target,
        position: {
          x: props.targetX,
          y: props.targetY,
        },
      })
    );
    return true;
  }
}
