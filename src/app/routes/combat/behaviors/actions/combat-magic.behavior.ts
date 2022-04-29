import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import * as Immutable from 'immutable';
import { combineLatest } from 'rxjs';
import { first, map } from 'rxjs/operators';
import * as _ from 'underscore';
import { CombatPlayerRenderBehaviorComponent } from '..';
import { CombatAttackSummary, CombatComponent } from '../..';
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
import { GameEntityObject } from '../../../../../app/scene/game-entity-object';
import { GameWorld } from '../../../../../app/services/game-world';
import { ImageResource } from '../../../../../game/pow-core';
import { getSoundEffectUrl, ISpriteMeta } from '../../../../../game/pow2/core/api';
import { SoundBehavior } from '../../../../../game/pow2/scene/behaviors/sound-behavior';
import { AnimatedSpriteBehavior } from '../../../../../game/pow2/tile/behaviors/animated-sprite.behavior';
import { SpriteComponent } from '../../../../../game/pow2/tile/behaviors/sprite.behavior';
import { DamageComponent } from '../../../../behaviors/damage.behavior';
import { IMagicTargetDelta } from '../../../../models/mechanics';
import { CombatEndTurnStateComponent, IPlayerActionCallback } from '../../states';
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
    public gameWorld: GameWorld
  ) {
    super();
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

  act(then?: IPlayerActionCallback): boolean {
    if (!this.isCurrentTurn()) {
      return false;
    }
    const done = (error?: any) => {
      then && then(this, error);
      this.combat.machine.setCurrentState(CombatEndTurnStateComponent.NAME);
    };
    if (!this.spell) {
      console.error('null spell to cast');
      return false;
    }
    switch (this.spell.id) {
      case 'heal':
        return this.healSpell(done);
      case 'push':
        return this.hurtSpell(done);
    }
    return true;
  }

  healSpell(done?: (error?: any) => any) {
    //
    const caster: GameEntityObject = this.from;
    const target: GameEntityObject = this.to;
    const attackerPlayer = caster.findBehavior(
      CombatPlayerRenderBehaviorComponent
    ) as CombatPlayerRenderBehaviorComponent;

    attackerPlayer.magic(() => {
      var healAmount: number = -this.spell.value;
      const healData: CombatAttack = {
        attacker: caster.model,
        defender: target.model,
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
      behaviors.animation.once('animation:done', () => {
        target.removeComponentDictionary(behaviors);
        const data: CombatAttackSummary = {
          damage: healAmount,
          attacker: caster,
          defender: target,
        };
        this.combat.machine.notify('combat:attackCombatant', data, done);
      });
    });

    return true;
  }

  hurtSpell(done?: (error?: any) => any) {
    //
    const attacker: GameEntityObject = this.from;
    const defender: GameEntityObject = this.to;
    const attackerPlayer = attacker.findBehavior<CombatPlayerRenderBehaviorComponent>(
      CombatPlayerRenderBehaviorComponent
    );
    const castSpell = () => {
      combineLatest([
        this.store.select(getCombatEntityEquipment(attacker.model.eid)),
        this.store.select(getCombatEntityEquipment(defender.model.eid)),
        this.store.select(getGameInventory),
      ])
        .pipe(
          first(),
          map((args) => {
            const equippedAttacker: EntityWithEquipment = args[0];
            const equippedDefender: EntityWithEquipment = args[1];
            const inventory: Immutable.List<Item> = args[2];
            const magicCastConfig: ICombatCastSpellConfig = {
              caster: equippedAttacker || attacker.model,
              spell: this.spell,
              targets: [equippedDefender || defender.model],
              inventory: inventory.toJS(),
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
            const targ: IMagicTargetDelta = magicEffects.targets[0];
            // NOTE: This is negative because the Attack action assumes positive values
            //       are damage. We should probably have a separate action for magic effects.
            const damage = -targ.healthDelta;
            const didKill: boolean = defender.model.hp - damage <= 0;
            const hit: boolean = damage > 0;
            const defending: boolean = defender.model.status.includes('guarding');
            const hitSound: string = getSoundEffectUrl(
              didKill ? 'killed' : hit ? (defending ? 'miss' : 'hit') : 'miss'
            );
            const attackData: CombatAttack = {
              attacker: attacker.model,
              defender: defender.model,
              damage,
            };
            this.store.dispatch(new CombatAttackAction(attackData));
            const damageAnimation: string = 'animHitSpell.png';
            const meta: ISpriteMeta =
              this.gameWorld.sprites.getSpriteMeta(damageAnimation);
            if (!meta) {
              console.warn(
                'could not find damage animation in sprites metadata: ' +
                  damageAnimation
              );
              return done();
            }

            this.gameWorld.sprites
              .getSpriteSheet(meta.source)
              .then((damageImages: ImageResource[]) => {
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
                defender.addComponentDictionary(behaviors);
                behaviors.damage.once('damage:done', () => {
                  if (attackerPlayer) {
                    attackerPlayer.setState();
                  }
                  if (didKill) {
                    _.defer(() => {
                      defender.destroy();
                    });
                  }
                  defender.removeComponentDictionary(behaviors);
                });
                const data: CombatAttackSummary = {
                  damage,
                  attacker,
                  defender,
                };
                this.combat.machine.notify('combat:attack', data, done);
              });
          })
        )
        .subscribe();
    };
    attackerPlayer.magic(castSpell);
    return true;
  }
}
