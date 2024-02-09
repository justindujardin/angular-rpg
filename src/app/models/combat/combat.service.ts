import { Injectable } from '@angular/core';
import { from, Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResourceManager } from '../../../app/core/resource-manager';
import { TiledTMXResource } from '../../../app/core/resources/tiled/tiled-tmx.resource';
import { ITiledLayer } from '../../../app/core/resources/tiled/tiled.model';
import { getMapUrl } from '../../core/api';
import { CombatantTypes } from '../base-entity';
import { EntityWithEquipment } from '../entity/entity.model';
import { EntityItemTypes } from '../entity/entity.reducer';
import { ITemplateBaseItem, ITemplateMagic } from '../game-data/game-data.model';
import { Armor, Weapon } from '../item';
import {
  calculateDamage,
  calculateMagicEffects,
  EnemyMechanics,
  ICalculateDamageConfig,
  ICalculateMagicEffectsConfig,
  ICalculateMagicTarget,
  ICombatDamage,
  IMagicEffects,
  PartyMechanics,
} from '../mechanics';
import { assertTrue } from '../util';
import { CombatEncounter } from './combat.model';

export interface ICombatCastSpellConfig {
  caster: CombatantTypes;
  spell: ITemplateMagic;
  targets: CombatantTypes[];
  inventory: ITemplateBaseItem[];
}

@Injectable()
export class CombatService {
  public readonly enemies = EnemyMechanics;
  public readonly party = PartyMechanics;
  constructor(private resourceLoader: ResourceManager) {}

  private _combatMap$ = new ReplaySubject<TiledTMXResource>(1);
  combatMap$: Observable<TiledTMXResource> = this._combatMap$;

  loadMap(combatZone: string): Observable<TiledTMXResource | null> {
    const mapUrl = getMapUrl('combat');
    return from(
      this.resourceLoader.load(mapUrl).then((maps: TiledTMXResource[]) => {
        if (!maps[0] || !maps[0].data) {
          return null;
        }
        const result: TiledTMXResource = maps[0];
        // Hide all layers that don't correspond to the current combat zone
        result.layers.forEach((l: ITiledLayer) => {
          l.visible = l.name === combatZone;
        });
        this._combatMap$.next(result);
        return result;
      }),
    );
  }

  loadEncounter(encounter: CombatEncounter): Observable<CombatEncounter> {
    assertTrue(encounter.zone, `loadEncounter: invalid zone given - ${encounter.zone}`);
    return this.loadMap(encounter.zone).pipe(map(() => encounter));
  }

  /**
   * One combatant attacks another!
   *
   * - sum the base attack and a weapon to get damage
   * - sum the base defense and all the armors to get defense
   * - damage = attack - defense with a minimum value of 1 if a hit lands
   *
   * @returns The damage calculated to apply to the defender.
   */
  attackCombatant(
    attacker: CombatantTypes | EntityWithEquipment,
    defender: CombatantTypes | EntityWithEquipment,
  ): ICombatDamage {
    const attackerEntity = attacker as EntityWithEquipment;
    const defenderEntity = defender as EntityWithEquipment;
    const attackerType = attackerEntity.type !== undefined ? 'party' : 'enemy';
    const defenderType = defenderEntity.type !== undefined ? 'party' : 'enemy';
    const dmgConfig: ICalculateDamageConfig = {
      attacker,
      attackerType,
      attackerWeapons: this.getWeapons(attacker),
      defender,
      defenderType,
      defenderArmor: this.getArmors(defender),
    };
    return calculateDamage(dmgConfig);
  }

  /**
   * Cast a spell at one or more targets!
   */
  castSpell(config: ICombatCastSpellConfig): IMagicEffects {
    const magicTargets: ICalculateMagicTarget[] = config.targets.map(
      (entity: CombatantTypes): ICalculateMagicTarget => {
        return {
          armors: this.getArmors(entity),
          entity,
          inventory: config.inventory.slice() as EntityItemTypes[],
          weapons: this.getWeapons(entity),
        };
      },
    );

    const casterEntity = config.caster as EntityWithEquipment;
    const targetEntity = config.targets[0] as EntityWithEquipment;
    const casterType = casterEntity.type !== undefined ? 'party' : 'enemy';
    const targetsType = targetEntity.type !== undefined ? 'party' : 'enemy';
    const dmgConfig: ICalculateMagicEffectsConfig = {
      spells: [config.spell],
      caster: casterEntity,
      casterType,
      targets: magicTargets,
      targetsType,
    };
    return calculateMagicEffects(dmgConfig);
  }

  getArmors(member: CombatantTypes): Armor[] {
    let armors: Armor[] = [];
    const equipped = member as EntityWithEquipment;
    if (equipped.shield) {
      armors.push(equipped.shield);
    }
    if (equipped.boots) {
      armors.push(equipped.boots);
    }
    if (equipped.armor) {
      armors.push(equipped.armor);
    }
    if (equipped.helm) {
      armors.push(equipped.helm);
    }
    if (equipped.accessory) {
      armors.push(equipped.accessory);
    }
    return armors;
  }
  getWeapons(member: CombatantTypes | null): Weapon[] {
    // NOTE: This only deals with a single weapon, but returns an array
    //  so it's easy to add dual-weapons later if it's desirable.
    let weapons: Weapon[] = [];
    const equipped = member as EntityWithEquipment | null;
    if (equipped?.weapon) {
      weapons.push(equipped.weapon);
    }
    return weapons;
  }
  //
  // Combat API helpers
  //

  isDefeated(test: CombatantTypes | null): boolean {
    return !test || test.hp <= 0;
  }
}
