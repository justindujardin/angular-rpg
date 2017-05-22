import * as _ from 'underscore';
import {GameEntityObject} from '../../../../scene/game-entity-object';
import {CombatEndTurnStateComponent} from '../../states/combat-end-turn.state';
import {getSoundEffectUrl, ISpriteMeta} from '../../../../../game/pow2/core/api';
import {AnimatedSpriteBehavior} from '../../../../../game/pow2/tile/behaviors/animated-sprite.behavior';
import {SpriteComponent} from '../../../../../game/pow2/tile/behaviors/sprite.behavior';
import {DamageComponent} from '../../../../behaviors/damage.behavior';
import {SoundBehavior} from '../../../../../game/pow2/scene/behaviors/sound-behavior';
import {CombatPlayerRenderBehaviorComponent} from '../combat-player-render.behavior';
import {CombatActionBehavior} from '../combat-action.behavior';
import {Component, Input} from '@angular/core';
import {IPlayerActionCallback} from '../../states/combat.machine';
import {CombatAttackSummary, CombatComponent} from '../../combat.component';
import {AppState} from '../../../../app.model';
import {Store} from '@ngrx/store';
import {CombatAttackAction} from '../../../../models/combat/combat.actions';
import {CombatAttack} from '../../../../models/combat/combat.model';
import {Entity, EntityWithEquipment} from '../../../../models/entity/entity.model';
import {GameWorld} from '../../../../services/game-world';
import {ImageResource} from '../../../../../game/pow-core/resources/image.resource';
import {CombatService} from '../../../../models/combat/combat.service';
import {getEntityEquipment} from '../../../../models/selectors';
/**
 * Attack another entity in combat.
 */
@Component({
  selector: 'combat-attack-behavior',
  template: '<ng-content></ng-content>'
})
export class CombatAttackBehaviorComponent extends CombatActionBehavior {
  name: string = 'attack';

  @Input() combat: CombatComponent;

  constructor(private store: Store<AppState>,
              private combatService: CombatService,
              private gameWorld: GameWorld) {
    super();
  }

  canBeUsedBy(entity: GameEntityObject) {
    // Exclude magic casters from physical attacks
    const excludedTypes = [
      'lifemage',
      'deathmage'
    ];
    const partyMember = entity.model as Entity;
    if (partyMember.type !== undefined && _.indexOf(excludedTypes, partyMember.type) !== -1) {
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
      this.combat.machine.setCurrentState(CombatEndTurnStateComponent.NAME);
    };

    //
    const attacker: GameEntityObject = this.from;
    const defender: GameEntityObject = this.to;
    const playerRender =
      attacker.findBehavior(CombatPlayerRenderBehaviorComponent) as CombatPlayerRenderBehaviorComponent;
    const attack = () => {
      this.store.select(getEntityEquipment(attacker.model.eid)).combineLatest(
        this.store.select(getEntityEquipment(defender.model.eid)),
        (equippedAttacker: EntityWithEquipment, equippedDefender: EntityWithEquipment) => {
          const damage: number =
            this.combatService.attackCombatant(equippedAttacker || attacker.model, equippedDefender || defender.model);
          const didKill: boolean = (defender.model.hp - damage) <= 0;
          const hit: boolean = damage > 0;
          const defending: boolean = false; // TODO: Maps to guard action
          const hitSound: string =
            getSoundEffectUrl(didKill ? 'killed' : (hit ? (defending ? 'miss' : 'hit') : 'miss'));

          const attackData: CombatAttack = {
            attacker: attacker.model,
            defender: defender.model,
            damage
          };
          this.store.dispatch(new CombatAttackAction(attackData));

          const damageAnimation: string = hit ? (defending ? 'animSmoke.png' : 'animHit.png') : 'animMiss.png';
          const meta: ISpriteMeta = this.gameWorld.sprites.getSpriteMeta(damageAnimation);
          if (!meta) {
            console.warn('could not find damage animation in sprites metadata: ' + damageAnimation);
            return done();
          }

          this.gameWorld.sprites.getSpriteSheet(meta.source).then((damageImages: ImageResource[]) => {
            const damageImage: HTMLImageElement = damageImages[0].data;
            const components = {
              animation: new AnimatedSpriteBehavior({
                spriteName: 'attack',
                lengthMS: 350
              }),
              sprite: new SpriteComponent({
                name: 'attack',
                icon: damageAnimation,
                meta,
                image: damageImage
              }),
              damage: new DamageComponent(),
              sound: new SoundBehavior({
                url: hitSound,
                volume: 0.3
              })
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
              defender
            };
            this.combat.machine.notify('combat:attack', data, done);
          });

        })
        .take(1)
        .subscribe();
    };

    if (playerRender) {
      playerRender.attack(attack);
    }
    else {
      // TODO: Shouldn't be here.  This mess is currently to delay NPC attacks.
      _.delay(() => {
        attack();
      }, 1000);
    }
    return true;
  }

}
