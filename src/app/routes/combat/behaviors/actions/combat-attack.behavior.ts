import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { first, map } from 'rxjs/operators';
import * as _ from 'underscore';
import { ImageResource } from '../../../../../app/core/resources/image.resource';
import { AppState } from '../../../../app.model';
import { AnimatedSpriteBehavior } from '../../../../behaviors/animated-sprite.behavior';
import { DamageComponent } from '../../../../behaviors/damage.behavior';
import { SoundBehavior } from '../../../../behaviors/sound-behavior';
import { SpriteComponent } from '../../../../behaviors/sprite.behavior';
import { getSoundEffectUrl, ISpriteMeta } from '../../../../core/api';
import { CombatAttackAction } from '../../../../models/combat/combat.actions';
import { CombatAttack } from '../../../../models/combat/combat.model';
import { CombatService } from '../../../../models/combat/combat.service';
import { Entity, EntityWithEquipment } from '../../../../models/entity/entity.model';
import { getCombatEntityEquipment } from '../../../../models/selectors';
import { GameEntityObject } from '../../../../scene/objects/game-entity-object';
import { GameWorld } from '../../../../services/game-world';
import { CombatAttackSummary, CombatComponent } from '../../combat.component';
import { IPlayerActionCallback } from '../../states/combat.machine';
import { CombatActionBehavior } from '../combat-action.behavior';
import { CombatPlayerRenderBehaviorComponent } from '../combat-player-render.behavior';
/**
 * Attack another entity in combat.
 */
@Component({
  selector: 'combat-attack-behavior',
  template: '<ng-content></ng-content>',
})
export class CombatAttackBehaviorComponent extends CombatActionBehavior {
  name: string = 'attack';

  @Input() combat: CombatComponent;

  constructor(
    private store: Store<AppState>,
    private combatService: CombatService,
    private gameWorld: GameWorld
  ) {
    super();
  }

  canBeUsedBy(entity: GameEntityObject) {
    // Exclude magic casters from physical attacks
    const excludedTypes = ['lifemage', 'deathmage'];
    const partyMember = entity.model as Entity;
    if (
      partyMember.type !== undefined &&
      _.indexOf(excludedTypes, partyMember.type) !== -1
    ) {
      return false;
    }
    return super.canBeUsedBy(entity);
  }

  act(then?: IPlayerActionCallback): boolean {
    if (!this.isCurrentTurn()) {
      return false;
    }
    const done = (error?: any) => {
      if (then) {
        then(this, error);
      }
      this.combat.machine.setCurrentState('end-turn');
    };

    //
    const attacker: GameEntityObject = this.from;
    const defender: GameEntityObject = this.to;
    const playerRender = attacker.findBehavior(
      CombatPlayerRenderBehaviorComponent
    ) as CombatPlayerRenderBehaviorComponent;
    const attack = () => {
      const attEquip = this.store.select(getCombatEntityEquipment(attacker.model.eid));
      const defEquip = this.store.select(getCombatEntityEquipment(defender.model.eid));
      combineLatest([attEquip, defEquip])
        .pipe(
          first(),
          map((args) => {
            const equippedAttacker: EntityWithEquipment = args[0];
            const equippedDefender: EntityWithEquipment = args[1];
            const damageOutput = this.combatService.attackCombatant(
              equippedAttacker || attacker.model,
              equippedDefender || defender.model
            );
            const damage = damageOutput.totalDamage;
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

            const hitAnim =
              damageOutput.damages.length > 1 ? 'animHit.png' : 'animSlash.png';
            const damageAnimation: string = hit
              ? defending
                ? 'animSmoke.png'
                : hitAnim
              : 'animMiss.png';
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
                const components = {
                  animation: new AnimatedSpriteBehavior({
                    spriteName: 'attack',
                    lengthMS: 350,
                  }),
                  sprite: new SpriteComponent({
                    name: 'attack',
                    icon: damageAnimation,
                    meta,
                    image: damageImage,
                  }),
                  damage: new DamageComponent(),
                  sound: new SoundBehavior({
                    url: hitSound,
                    volume: 0.3,
                  }),
                };
                if (playerRender) {
                  playerRender.setState('Moving');
                }
                defender.addComponentDictionary(components);
                components.damage.once('damage:done', () => {
                  if (playerRender) {
                    playerRender.setState();
                  }
                  if (didKill) {
                    _.defer(() => {
                      defender.destroy();
                    });
                  }
                  defender.removeComponentDictionary(components);
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

    if (playerRender) {
      playerRender.attack(attack);
    } else {
      // TODO: Shouldn't be here.  This mess is currently to delay NPC attacks.
      _.delay(() => {
        attack();
      }, 300);
    }
    return true;
  }
}
