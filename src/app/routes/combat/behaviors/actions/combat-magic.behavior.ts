import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import * as Immutable from 'immutable';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, first, take } from 'rxjs/operators';
import * as _ from 'underscore';
import { CombatComponent } from '../..';
import { AppState } from '../../../../../app/app.model';
import { EntityType, IPartyMember } from '../../../../../app/models/base-entity';
import { CombatAttackAction } from '../../../../../app/models/combat/combat.actions';
import { CombatAttack } from '../../../../../app/models/combat/combat.model';
import {
  CombatService,
  ICombatCastSpellConfig,
} from '../../../../../app/models/combat/combat.service';
import { EntityWithEquipment } from '../../../../../app/models/entity/entity.model';
import { Item } from '../../../../../app/models/item';
import {
  getCombatEntityEquipment,
  getGameInventory,
} from '../../../../../app/models/selectors';
import { GameEntityObject } from '../../../../../app/scene/objects/game-entity-object';
import { GameWorld } from '../../../../../app/services/game-world';
import { AnimatedSpriteBehavior } from '../../../../behaviors/animated-sprite.behavior';
import { DamageComponent } from '../../../../behaviors/damage.behavior';
import { SoundBehavior } from '../../../../behaviors/sound-behavior';
import { SpriteComponent } from '../../../../behaviors/sprite.behavior';
import { ImageResource, ResourceManager } from '../../../../core';
import { getSoundEffectUrl, ISpriteMeta } from '../../../../core/api';
import {
  ITemplateBaseItem,
  ITemplateMagic,
} from '../../../../models/game-data/game-data.model';
import { IMagicTargetDelta } from '../../../../models/mechanics';
import { assertTrue } from '../../../../models/util';
import { CombatPlayerComponent } from '../../combat-player.component';
import { CombatAttackSummary } from '../../combat.types';
import { CombatEndTurnStateComponent } from '../../states';
import { CombatActionBehavior } from '../combat-action.behavior';

/**
 * Use magic in
 */
@Component({
  selector: 'combat-magic-behavior',
  template: '<ng-content></ng-content>',
})
export class CombatMagicBehavior extends CombatActionBehavior {
  name: string = 'magic';
  @Input() combat: CombatComponent;

  constructor(
    public store: Store<AppState>,
    public combatService: CombatService,
    public gameWorld: GameWorld,
    protected loader: ResourceManager
  ) {
    super(loader, gameWorld);
  }

  canBeUsedBy(entity: GameEntityObject) {
    // Include only magic casters
    var supportedTypes: EntityType[] = ['mage', 'healer'];
    const pm = entity.model as IPartyMember;
    if (!pm) {
      return false;
    }
    const canClassUse = _.indexOf(supportedTypes, pm.type) !== -1;
    const hasSpells = this.combat.machine.spells.size > 0;
    return super.canBeUsedBy(entity) && canClassUse && hasSpells;
  }

  async act(): Promise<boolean> {
    if (!this.isCurrentTurn()) {
      return false;
    }
    if (!this.spell) {
      console.error('null spell to cast');
      return false;
    }
    switch (this.spell.id) {
      case 'heal':
        await this.healSpell();
        break;
      case 'push':
        await this.hurtSpell();
    }
    this.combat.machine.setCurrentState(CombatEndTurnStateComponent.NAME);
    return true;
  }

  async healSpell() {
    //
    const caster: GameEntityObject | null = this.from;
    const target: GameEntityObject | null = this.to;
    const spell: ITemplateMagic | null = this.spell;
    assertTrue(caster, 'CombatMagicBehavior: invalid caster source');
    assertTrue(target, 'CombatMagicBehavior: invalid caster target');
    assertTrue(spell, 'CombatMagicBehavior: invalid spell');
    const casterModel: any = caster.model;
    const targetModel: any = target.model;
    assertTrue(casterModel, 'CombatMagicBehavior: invalid caster source model');
    assertTrue(targetModel, 'CombatMagicBehavior: invalid caster target model');

    const attackerPlayer = caster as CombatPlayerComponent;
    const done$ = new BehaviorSubject<boolean>(false);
    const attackEffectsPromise = done$
      .pipe(
        filter((d) => d === true),
        take(1)
      )
      .toPromise();
    const attackAnimPromise = attackerPlayer.magic(async () => {
      var healAmount: number = -spell.value;
      const healData: CombatAttack = {
        attacker: casterModel,
        defender: targetModel,
        damage: healAmount,
      };
      this.store.dispatch(new CombatAttackAction(healData));
      var hitSound: string = getSoundEffectUrl('heal');
      var behaviors = {
        animation: new AnimatedSpriteBehavior({
          spriteName: 'heal',
          lengthMS: 550,
        }),
        sprite: new SpriteComponent({
          name: 'heal',
          icon: 'animSpellCast.png',
        }),
        sound: new SoundBehavior({
          url: hitSound,
          volume: 0.3,
        }),
      };
      target.addComponentDictionary(behaviors);
      await behaviors.animation.onDone$.pipe(take(1)).toPromise();
      target.removeComponentDictionary(behaviors);
      const data: CombatAttackSummary = {
        damage: healAmount,
        attacker: casterModel,
        defender: targetModel,
      };
      await this.combat.machine.onAttack$.emit(data);
      done$.next(true);
    });
    await Promise.all([attackAnimPromise, attackEffectsPromise]);
    return true;
  }

  async hurtSpell() {
    const caster: GameEntityObject | null = this.from;
    const target: GameEntityObject | null = this.to;
    const spell: ITemplateMagic | null = this.spell;
    assertTrue(caster, 'CombatMagicBehavior: invalid caster source');
    assertTrue(target, 'CombatMagicBehavior: invalid caster target');
    assertTrue(spell, 'CombatMagicBehavior: invalid spell');
    const casterModel: any = caster.model;
    const targetModel: any = target.model;
    assertTrue(casterModel, 'CombatMagicBehavior: invalid caster source model');
    assertTrue(targetModel, 'CombatMagicBehavior: invalid caster target model');
    const attackerPlayer = caster as CombatPlayerComponent;
    if (!attackerPlayer) {
      return;
    }
    const done$ = new BehaviorSubject<boolean>(false);
    const actionCompletePromise = done$
      .pipe(
        filter((d) => d === true),
        take(1)
      )
      .toPromise();

    const castSpell = async () => {
      combineLatest([
        this.store.select(getCombatEntityEquipment(casterModel.eid)),
        this.store.select(getCombatEntityEquipment(targetModel.eid)),
        this.store.select(getGameInventory),
      ])
        .pipe(first())
        .subscribe(async (args) => {
          const equippedAttacker: EntityWithEquipment | null = args[0];
          const equippedDefender: EntityWithEquipment | null = args[1];
          const inventory: Immutable.List<Item> = args[2];
          await this.doHurtSpellAction(equippedAttacker, equippedDefender, inventory);
          done$.next(true);
        });
    };
    const spellCastPromise = attackerPlayer.magic(castSpell);
    await Promise.all([actionCompletePromise, spellCastPromise]);
    return true;
  }

  private async doHurtSpellAction(
    equippedAttacker: EntityWithEquipment | null,
    equippedDefender: EntityWithEquipment | null,
    inventory: Immutable.List<Item>
  ) {
    const caster: GameEntityObject | null = this.from;
    const target: GameEntityObject | null = this.to;
    const spell: ITemplateMagic | null = this.spell;
    assertTrue(caster, 'CombatMagicBehavior: invalid caster source');
    assertTrue(target, 'CombatMagicBehavior: invalid caster target');
    assertTrue(spell, 'CombatMagicBehavior: invalid spell');
    const attackerPlayer = caster as CombatPlayerComponent;
    const casterModel: any = caster.model;
    const targetModel: any = target.model;
    assertTrue(casterModel, 'CombatMagicBehavior: invalid caster source model');
    assertTrue(targetModel, 'CombatMagicBehavior: invalid caster target model');

    const magicCastConfig: ICombatCastSpellConfig = {
      caster: equippedAttacker || casterModel,
      spell: spell,
      targets: [equippedDefender || targetModel],
      inventory: inventory.toJS() as ITemplateBaseItem[],
    };
    const magicEffects = this.combatService.castSpell(magicCastConfig);
    if (magicEffects.targets.length > 1) {
      // TODO: the Damage effects are kind of hardcoded here. We need to
      //       loop over the targets and apply many damage effects. Perhaps
      //       we need a damageService similar to notifyService that handles
      //       the async nature of applying damage and cleaning up. Then we
      //       could do a simple for loop here and this would be cleaned up
      //       immensely.
      throw new Error('No support for multiple magic targets yet.');
    }
    const targ: IMagicTargetDelta | undefined = magicEffects.targets[0];
    // NOTE: This is negative because the Attack action assumes positive values
    //       are damage. We should probably have a separate action for magic effects.
    assertTrue(targ, 'no magic effect');
    const damage = -(targ.healthDelta || 0);
    const didKill: boolean = targetModel.hp - damage <= 0;
    const attackData: CombatAttack = {
      attacker: casterModel,
      defender: targetModel,
      damage,
    };
    this.store.dispatch(new CombatAttackAction(attackData));
    const damageAnimation: string = 'animHitSpell.png';
    const meta: ISpriteMeta | null =
      this.gameWorld.sprites.getSpriteMeta(damageAnimation);
    if (!meta) {
      console.warn(
        'could not find damage animation in sprites metadata: ' + damageAnimation
      );
      return;
    }

    const damageImages: ImageResource[] = await this.gameWorld.sprites.getSpriteSheet(
      meta.source
    );
    const damageImage: HTMLImageElement = damageImages[0].data;
    var hitSound: string = getSoundEffectUrl('spell');
    var behaviors = {
      animation: new AnimatedSpriteBehavior({
        spriteName: 'heal',
        lengthMS: 550,
      }),
      damage: new DamageComponent(),
      sprite: new SpriteComponent({
        name: 'heal',
        icon: 'animSpellCast.png',
        image: damageImage,
      }),
      sound: new SoundBehavior({
        url: hitSound,
        volume: 0.3,
      }),
    };
    target.addComponentDictionary(behaviors);
    await behaviors.damage.onDone$.pipe(take(1)).toPromise();
    if (attackerPlayer) {
      attackerPlayer.setState();
    }
    if (didKill) {
      target.destroy();
    }
    target.removeComponentDictionary(behaviors);
    const data: CombatAttackSummary = {
      damage,
      attacker: caster,
      defender: target,
    };
    await this.combat.machine.onAttack$.emit(data);
    return true;
  }
}
