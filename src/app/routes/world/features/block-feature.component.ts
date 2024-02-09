import { Component, Input } from '@angular/core';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { TileObject } from '../../../scene/tile-object';
import { IMapFeatureProperties, MapFeatureComponent } from '../map-feature.component';

export interface IBlockFeatureProperties extends IMapFeatureProperties {
  passable: boolean;
}

@Component({
  selector: 'block-feature',
  template: ` <ng-content></ng-content>`,
})
export class BlockFeatureComponent extends MapFeatureComponent {
  @Input() feature: ITiledObject<IBlockFeatureProperties> | null = null;

  enter(object: TileObject): boolean {
    return false;
  }
}
