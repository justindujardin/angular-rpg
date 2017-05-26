import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs/Rx';
import {ResourceManager} from '../../../game/pow-core/resource-manager';
import {CombatantTypes, CombatEncounter} from './combat.model';
import {getMapUrl} from '../../../game/pow2/core/api';
import {TiledTMXResource} from '../../../game/pow-core/resources/tiled/tiled-tmx.resource';
import {BaseEntity} from '../base-entity';
import {ITiledLayer} from '../../../game/pow-core/resources/tiled/tiled.model';
import * as _ from 'underscore';
import {EntityWithEquipment} from '../entity/entity.model';

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
  rollHit(attacker: CombatantTypes, defender: CombatantTypes): boolean {
    const roll: number = _.random(0, 200);
    const attackerEvasion: number = this.getSpeed(attacker);
    const defenderEvasion: number = this.getSpeed(defender);
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

  getSpeed(target: CombatantTypes): number {
    return target.speed;
  }

  /**
   * One combatant attacks another!
   *
   * - sum the base attack and a weapon to get damage
   * - sum the base defense and all the armors to get defense
   * - damage = attack - defense with a minimum value of 1 if a hit lands
   *
   * @returns {number} The damage value to apply to the defender.
   */
  attackCombatant(attacker: CombatantTypes, defender: CombatantTypes): number {
    const attackStrength = this.getAttack(attacker);
    const defense = this.getDefense(defender);
    const amount = attackStrength - defense;
    const damage = this.varyDamage(amount);
    if (this.rollHit(attacker, defender)) {
      return Math.ceil(damage);
    }
    return 0;
  }

  /**
   * Determine the total defense value of this character including all equipped accessories and armor
   */
  getDefense(member: CombatantTypes): number {
    const equipped = member as EntityWithEquipment;
    const shieldDefense = equipped.shield ? equipped.shield.defense : 0;
    const armorDefense = equipped.armor ? equipped.armor.defense : 0;
    const bootsDefense = equipped.boots ? equipped.boots.defense : 0;
    const helmDefense = equipped.helm ? equipped.helm.defense : 0;
    const accessoryDefense = equipped.accessory ? equipped.accessory.defense : 0;
    return member.defense + shieldDefense + armorDefense + bootsDefense + helmDefense + accessoryDefense;
  }

  /**
   * The total attack strength of this combatant including any weapons
   */
  getAttack(combatant: CombatantTypes): number {
    return this.getWeaponStrength(combatant) + combatant.attack;
  }

  getMagic(combatant: CombatantTypes): number {
    return combatant.magic;
  }

  getWeaponStrength(combatant: CombatantTypes): number {
    const equipped = combatant as EntityWithEquipment;
    return equipped.weapon ? equipped.weapon.attack : 0;
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
