import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { getEnemyById } from 'app/models/game-data/enemies';
import { RANDOM_ENCOUNTERS_DATA } from 'app/models/game-data/random-encounters';
import * as Immutable from 'immutable';
import { List } from 'immutable';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { IEnemy } from '../../../../app/models/base-entity';
import { Scene } from '../../../../game/pow2/scene/scene';
import { AppState } from '../../../app.model';
import { IMoveDescription } from '../../../behaviors/movable-behavior';
import { SceneObjectBehavior } from '../../../behaviors/scene-object-behavior';
import { CombatEncounterAction } from '../../../models/combat/combat.actions';
import { CombatEncounter, IZoneMatch } from '../../../models/combat/combat.model';
import { Entity } from '../../../models/entity/entity.model';
import { instantiateEntity } from '../../../models/game-data/game-data.model';
import { GameStateSetBattleCounterAction } from '../../../models/game-state/game-state.actions';
import { getGameBattleCounter, getGameParty } from '../../../models/selectors';
import { GameEntityObject } from '../../../scene/game-entity-object';
import { GameTileMap } from '../../../scene/game-tile-map';
import { PlayerBehaviorComponent } from './player-behavior';

/**
 * A behavior that decrements the party battleCounter each time a move
 * description is given to the `completeMove` method.
 *
 * When the party battleCounter reaches zero, a random encounter will
 * be started in the current combat zone. Combat zones are defined in
 * map files. See `wilderness.tmx` for an example.
 */
@Component({
  selector: 'combat-encounter-behavior',
  template: ` <ng-content></ng-content>`,
})
export class CombatEncounterBehaviorComponent extends SceneObjectBehavior {
  @Input() scene: Scene;
  @Input() tileMap: GameTileMap;
  @Input() player: GameEntityObject;

  battleCounter$: Observable<number> = this.store.select(getGameBattleCounter);

  constructor(private store: Store<AppState>) {
    super();
  }

  completeMove(move: IMoveDescription) {
    if (!this.tileMap) {
      return;
    }
    const map = this.tileMap.map;
    if (!map || !map.properties || !map.properties.combat) {
      return;
    }
    const terrain = this.tileMap.getTerrain('Terrain', move.to.x, move.to.y);
    const isDangerous: boolean = terrain?.properties?.isDangerous;
    const dangerValue: number = isDangerous ? 10 : 6;
    this.battleCounter$.pipe(take(1)).subscribe((currentCounter: number) => {
      const newCounter: number = currentCounter - dangerValue;
      if (newCounter <= 0) {
        this.triggerCombat(move);
      } else {
        this.store.dispatch(new GameStateSetBattleCounterAction(newCounter));
      }
    });
  }

  rollBattleCounter(): number {
    const max: number = 255;
    const min: number = 64;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  triggerCombat(move: IMoveDescription) {
    const at = move.to;
    const zone: IZoneMatch = this.tileMap.getCombatZones(at);
    if (!zone) {
      throw new Error('missing combat zone at point: ' + at);
    }

    // Set a new battle counter value
    const newCounter = this.rollBattleCounter();
    this.store.dispatch(new GameStateSetBattleCounterAction(newCounter));

    // Stop the moving entity until it has defeated the combat encounter.
    const mover = this.player.findBehavior(
      PlayerBehaviorComponent
    ) as PlayerBehaviorComponent;
    if (mover) {
      mover.velocity.zero();
    }
    // Start combat
    this.store
      .select(getGameParty)
      .pipe(
        map((party: Immutable.List<Entity>) => {
          const viableEncounters = RANDOM_ENCOUNTERS_DATA.filter((enc: any) => {
            return (
              enc.zones.indexOf(zone.map) !== -1 ||
              enc.zones.indexOf(zone.target) !== -1
            );
          });
          if (viableEncounters.length === 0) {
            throw new Error('no valid encounters for this zone');
          }
          const max = viableEncounters.length - 1;
          const min = 0;
          const encounter =
            viableEncounters[Math.floor(Math.random() * (max - min + 1)) + min];
          const toCombatant = (id: string): IEnemy => {
            const itemTemplate: IEnemy = getEnemyById(id) as any;
            return instantiateEntity<IEnemy>(itemTemplate, {
              maxhp: itemTemplate.hp,
            });
          };

          const payload: CombatEncounter = {
            type: 'random',
            id: encounter.id,
            enemies: List<IEnemy>(encounter.enemies.map(toCombatant)),
            zone: zone.target || zone.map,
            message: List<string>(encounter.message),
            party: List<Entity>(party),
          };
          this.store.dispatch(new CombatEncounterAction(payload));
        }),
        take(1)
      )
      .subscribe();
  }
}
