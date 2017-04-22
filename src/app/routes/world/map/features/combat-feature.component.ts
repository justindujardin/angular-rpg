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
import {TiledFeatureComponent, TiledMapFeatureData} from '../map-feature.component';
import {GameEntityObject} from '../../../../scene/game-entity-object';
import {PlayerBehaviorComponent} from '../../behaviors/player-behavior';
import {Component, Input} from '@angular/core';
import {Combatant, CombatFixedEncounter, IZoneMatch} from '../../../../models/combat/combat.model';
import {ITemplateEnemy, ITemplateFixedEncounter} from '../../../../models/game-data/game-data.model';
import {AppState} from '../../../../app.model';
import {Store} from '@ngrx/store';
import {getGameDataEnemies, getGameDataFixedEncounters, getGameParty} from '../../../../models/selectors';
import {Entity} from '../../../../models/entity/entity.model';
import {CombatFixedEncounterAction} from '../../../../models/combat/combat.actions';
/**
 * A map feature that represents a fixed combat encounter.
 *
 * When a player enters the tile of a feature with this component
 * it will trigger a combat encounter that must be defeated before
 * the tile may be passed.
 */
@Component({
  selector: 'combat-feature',
  template: `
    <ng-content></ng-content>`
})
export class CombatFeatureComponent extends TiledFeatureComponent {
  party: PlayerBehaviorComponent = null;

  @Input() feature: TiledMapFeatureData;

  constructor(public store: Store<AppState>) {
    super();
  }

  connectBehavior(): boolean {
    if (!this.properties || !this.properties.id) {
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

    this.store.select(getGameParty)
      .withLatestFrom(
        this.store.select(getGameDataFixedEncounters),
        this.store.select(getGameDataEnemies),
        (party: Entity[], encounters: ITemplateFixedEncounter[], enemies: ITemplateEnemy[]) => {
          const encounter: ITemplateFixedEncounter = encounters.find((e) => e.id === this.properties.id);
          const toCombatant = (id: string): Combatant => {
            const itemTemplate = enemies.find((e) => e.id === id);
            return Object.assign({
              maxhp: itemTemplate.hp,
              maxmp: itemTemplate.mp
            }, itemTemplate) as Combatant;
          };
          const payload: CombatFixedEncounter = {
            id: encounter.id,
            enemies: encounter.enemies.map(toCombatant),
            zone: zone.target,
            message: encounter.message,
            party: party.slice()
          };
          this.store.dispatch(new CombatFixedEncounterAction(payload));

          console.log("ENCOUNTER!", party, encounters, enemies);
        })
      .take(1)
      .subscribe();
    return true;
  }

  //
  // fixedEncounter(zone: IZoneMatch, encounter: ITemplateFixedEncounter) {
  //   if (!encounter) {
  //     return;
  //   }
  //   this.doEncounter(zone, encounter);
  // }
  //
  // private doEncounter(zoneInfo: IZoneMatch, encounter: ITemplateEncounter, then?: IGameEncounterCallback) {
  //
  //   const enemyList: any[] = []; // this.spreadsheet.getSheetData('enemies');
  //   const toCombatant = (id: string): Combatant => {
  //     const itemTemplate = _.where(enemyList, {
  //       id
  //     })[0];
  //     itemTemplate.maxhp = itemTemplate.hp;
  //     itemTemplate.maxmp = itemTemplate.mp;
  //     return Object.assign({}, itemTemplate) as Combatant;
  //   };
  //
  //   const payload: CombatFixedEncounter = {
  //     id: encounter.id,
  //     enemies: encounter.enemies.map(toCombatant),
  //     zone: zoneInfo.target,
  //     message: encounter.message,
  //     party: [] // TODO: entity
  //   };
  //   this.store.dispatch(new CombatFixedEncounterAction(payload));
  // }


}
