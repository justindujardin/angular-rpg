/*
 Copyright (C) 2013-2020 by Justin DuJardin and Contributors

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
import { Component, Input } from '@angular/core';
import { getEnemyById } from 'app/models/game-data/enemies';
import { getFixedEncounterById } from 'app/models/game-data/fixed-encounters';
import * as Immutable from 'immutable';
import { List } from 'immutable';
import { map, take } from 'rxjs/operators';
import { Point } from '../../../core';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { IEnemy } from '../../../models/base-entity';
import { CombatEncounterAction } from '../../../models/combat/combat.actions';
import { CombatEncounter, IZoneMatch } from '../../../models/combat/combat.model';
import { Entity } from '../../../models/entity/entity.model';
import {
  instantiateEntity,
  ITemplateFixedEncounter,
} from '../../../models/game-data/game-data.model';
import { getGameParty } from '../../../models/selectors';
import { assertTrue } from '../../../models/util';
import { GameFeatureObject } from '../../../scene/objects/game-feature-object';
import { PlayerBehaviorComponent } from '../behaviors/player-behavior';
import { IMapFeatureProperties, MapFeatureComponent } from '../map-feature.component';

export interface ICombatFeatureProperties extends IMapFeatureProperties {
  /** The unique encounter id as defined in fixed-counters.ts */
  id: string;
}

/**
 * A map feature that represents a fixed combat encounter.
 *
 * When a player enters the tile of a feature with this component
 * it will trigger a combat encounter that must be defeated before
 * the tile may be passed.
 */
@Component({
  selector: 'combat-feature',
  template: ` <ng-content></ng-content>`,
})
export class CombatFeatureComponent extends MapFeatureComponent {
  party: PlayerBehaviorComponent | null = null;

  // @ts-ignore
  @Input() feature: ITiledObject<ICombatFeatureProperties> | null;

  enter(object: GameFeatureObject): boolean {
    const properties = this.feature?.properties;
    assertTrue(properties, 'combat-feature-component: invalid properties');
    if (!properties.id) {
      return false;
    }
    this.party = object.findBehavior<PlayerBehaviorComponent>(PlayerBehaviorComponent);
    if (!this.party) {
      return false;
    }

    // Stop the moving entity until it has defeated the combat encounter.
    this.party.velocity.zero();
    object.setPoint(object.point);

    // Find the combat zone and launch a fixed encounter.
    const zone: IZoneMatch | null =
      this.party.map?.getCombatZones(new Point(this.party.host.point)) || null;
    if (!zone?.targets.length) {
      return false;
    }

    this.store
      .select(getGameParty)
      .pipe(
        map((party: Immutable.List<Entity>) => {
          const encounter: ITemplateFixedEncounter | null = getFixedEncounterById(
            properties.id
          );

          if (!encounter) {
            this.notify.show(
              `There is no encounter named: ${properties.id}.`,
              undefined,
              0
            );
            return;
          }
          const toCombatant = (id: string): IEnemy => {
            const itemTemplate: IEnemy = getEnemyById(id) as any;
            return instantiateEntity<IEnemy>(itemTemplate, {
              maxhp: itemTemplate.hp,
            });
          };
          const payload: CombatEncounter = {
            type: 'fixed',
            id: encounter.id,
            enemies: List<IEnemy>(encounter.enemies.map(toCombatant)),
            zone: zone.targets[0].zone || zone.map,
            message: List<string>(encounter.message || []),
            gold: encounter.gold,
            items: List<string>(encounter.items || []),
            party: List<Entity>(party),
          };
          this.store.dispatch(new CombatEncounterAction(payload));
        }),
        take(1)
      )
      .subscribe();
    return true;
  }
}
