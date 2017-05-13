import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs/Rx';
import {ResourceManager} from '../../../game/pow-core/resource-manager';
import {Combatant, CombatEncounter} from './combat.model';
import {getMapUrl} from '../../../game/pow2/core/api';
import {TiledTMXResource} from '../../../game/pow-core/resources/tiled/tiled-tmx.resource';
import {BaseEntity} from '../base-entity';
import {ITiledLayer} from '../../../game/pow-core/resources/tiled/tiled.model';
import * as _ from 'underscore';

@Injectable()
export class CombatService {

  constructor(private resourceLoader: ResourceManager) {
  }

  private _combatMap$ = new ReplaySubject<TiledTMXResource>(1);
  combatMap$: Observable<TiledTMXResource> = this._combatMap$;

  loadMap(combatZone: string): Observable<TiledTMXResource> {
    const mapUrl = getMapUrl('combat');
    return Observable.fromPromise(this.resourceLoader.load(mapUrl)
      .then((maps: TiledTMXResource[]) => {
        if (!maps[0] || !maps[0].data) {
          return null;
        }
        const result: TiledTMXResource = maps[0];
        // Hide all layers that don't correspond to the current combat zone
        result.layers.forEach((l: ITiledLayer) => {
          l.visible = (l.name === combatZone);
        });
        this._combatMap$.next(result);
        return result;
      }));
  }

  loadEncounter(encounter: CombatEncounter): Observable<CombatEncounter> {
    return this.loadMap(encounter.zone).map(() => encounter);
  }

  //
  // Combat API helpers
  //

  isDefeated(test: BaseEntity): boolean {
    return !test || test.hp <= 0;
  }

// Chance to hit = (BASE_CHANCE_TO_HIT + PLAYER_HIT_PERCENT) - EVASION
  rollHit(attacker: Combatant, defender: Combatant): boolean {
    const roll: number = _.random(0, 200);
    const attackerEvasion: number = this.getEvasion(attacker);
    const defenderEvasion: number = this.getEvasion(defender);
    const favorDodge = attackerEvasion < defenderEvasion;
    const chance: number = favorDodge ? 180 : 120; // TODO: Some real calculation here
    if (roll === 200) {
      return false;
    }
    if (roll === 0) {
      return true;
    }
    return roll <= chance;
  }

  getEvasion(target: Combatant): number {
    return target.speed;
  }

  attackCombatant(attacker: Combatant, defender: Combatant): number {
    const amount = this.getAttackStrength(attacker);
    const damage = this.varyDamage(amount);
    if (this.rollHit(attacker, defender)) {
      return Math.ceil(damage);
    }
    return 0;
  }

  getDefense(member: Combatant, base: boolean = false): number {
    return member.defense;
    // var obj: any = this;
    // var basedefense: number = _.reduce(PARTY_ARMOR_TYPES, (val: number, type: string) => {
    //   var item: any = obj[type];
    //   if (!item) {
    //     return val;
    //   }
    //   return val + item.attributes.defense;
    // }, 0);
    // return basedefense + (base ? 0 : defenseBuff);
  }

  getAttackStrength(combatant: Combatant): number {
    return this.getWeaponStrength(combatant) + combatant.attack / 2;
  }

  getMagicStrength(combatant: Combatant): number {
    return this.getWeaponStrength(combatant) + combatant.magic / 2;
  }

  getWeaponStrength(combatant: Combatant): number {
    return 0;
  }

  /**
   * Given a base amount of damage, vary the output to be somewhere between 80% and 120%
   * of the input.
   */
  varyDamage(amount: number): number {
    const max = amount * 1.2;
    const min = amount * 0.8;
    return Math.max(1, Math.floor(Math.random() * (max - min + 1)) + min);
  }

}
