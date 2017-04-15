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
import {TiledMapFeatureData, TiledFeatureComponent} from '../map-feature.component';
import {GameEntityObject} from '../../../../scene/game-entity-object';
import {PlayerBehaviorComponent} from '../../behaviors/player-behavior';
import {Component, Input} from '@angular/core';
import {IZoneMatch} from '../../../../models/combat/combat.model';
/**
 * A map feature that represents a fixed combat encounter.
 *
 * When a player enters the tile of a feature with this component
 * it will trigger a combat encounter that must be defeated before
 * the tile may be passed.
 */
@Component({
  selector: 'combat-feature',
  template: `<ng-content></ng-content>`
})
export class CombatFeatureComponent extends TiledFeatureComponent {
  party: PlayerBehaviorComponent = null;

  @Input() feature: TiledMapFeatureData;

  connectBehavior(): boolean {
    if(!this.properties || !this.properties.id) {
      console.error('Fixed encounters must have a given id so they may be hidden');
      return false;
    }
    return super.connectBehavior();
  }

  enter(object: GameEntityObject): boolean {
    this.party = object.findBehavior(PlayerBehaviorComponent) as PlayerBehaviorComponent;
    if (!this.party) {
      return false;
    }

    // Stop the moving entity until it has defeated the combat encounter.
    this.party.velocity.zero();
    object.setPoint(object.point);

    // Find the combat zone and launch a fixed encounter.
    const zone: IZoneMatch = this.host.tileMap.getCombatZones(this.party.host.point);
    zone.fixed = true;
    this.host.world.fixedEncounter(zone, this.host.id, (victory: boolean) => {
      if (victory) {
        console.warn('set data hidden combat feature');
        // this.setDataHidden(true);
      }
    });
    return true;
  }
}
