import * as _ from "underscore";
import {GameEntityObject} from "../../../../../game/rpg/objects/gameEntityObject";
import {HeroTypes} from "../../../../../game/rpg/models/heroModel";
import {CombatEndTurnState} from "../../states/combat-end-turn.state";
import {getSoundEffectUrl} from "../../../../../game/pow2/core/api";
import {AnimatedSpriteComponent} from "../../../../../game/pow2/tile/components/animatedSpriteComponent";
import {SpriteComponent} from "../../../../../game/pow2/tile/components/spriteComponent";
import {DamageComponent} from "../../../../../game/rpg/components/damageComponent";
import {SoundComponent} from "../../../../../game/pow2/scene/components/soundComponent";
import {CreatureModel} from "../../../../../game/rpg/models/creatureModel";
import {CombatPlayerRenderBehavior} from "../combat-player-render.behavior";
import {CombatActionBehavior} from "../combat-action.behavior";
import {Component, Input} from "@angular/core";
import {IPlayerActionCallback} from "../../states/combat.machine";
import {CombatComponent} from "../../combat.component";
import {AppState} from "../../../../app.model";
import {Store} from "@ngrx/store";
import {CombatAttackAction} from "../../../../models/combat/combat.actions";
import {CombatAttack} from "../../../../models/combat/combat.model";
import * as rules from "../../../../models/combat/combat.api";
import {PartyMember} from "../../../../models/party/party.model";
/**
 * Attack another entity in combat.
 */
@Component({
  selector: 'combat-attack-behavior',
  template: '<ng-content></ng-content>'
})
export class CombatAttackBehavior extends CombatActionBehavior {
  name: string = 'attackCombatant';

  @Input() combat: CombatComponent;

  constructor(private store: Store<AppState>) {
    super();
  }

  canBeUsedBy(entity: GameEntityObject) {
    // Exclude magic casters from physical attacks
    const excludedTypes = [
      HeroTypes.LifeMage,
      HeroTypes.Necromancer
    ];
    const partyMember = entity.model as PartyMember;
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
      then && then(this, error);
      this.combat.machine.setCurrentState(CombatEndTurnState.NAME);
    };

    //
    const attacker: GameEntityObject = this.from;
    const defender: GameEntityObject = this.to;
    let attackerPlayer = attacker.findBehavior(CombatPlayerRenderBehavior) as CombatPlayerRenderBehavior;
    const attack = () => {
      const damage: number = rules.attackCombatant(attacker.model, defender.model);
      const didKill: boolean = defender.model.hp <= 0;
      const hit: boolean = damage > 0;
      const defending: boolean = false; // TODO: Maps to guard action
      const hitSound: string = getSoundEffectUrl(didKill ? 'killed' : (hit ? (defending ? 'miss' : 'hit') : 'miss'));

      const attackData: CombatAttack = {
        attacker: attacker.model,
        defender: defender.model,
        damage: damage
      };
      this.store.dispatch(new CombatAttackAction(attackData));

      const components = {
        animation: new AnimatedSpriteComponent({
          spriteName: 'attack',
          lengthMS: 350
        }),
        sprite: new SpriteComponent({
          name: 'attack',
          icon: hit ? (defending ? 'animSmoke.png' : 'animHit.png') : 'animMiss.png'
        }),
        damage: new DamageComponent(),
        sound: new SoundComponent({
          url: hitSound,
          volume: 0.3
        })
      };
      if (!!attackerPlayer) {
        attackerPlayer.setState('Moving');
      }
      defender.addComponentDictionary(components);
      components.damage.once('damage:done', () => {
        if (!!attackerPlayer) {
          attackerPlayer.setState();
        }
        if (didKill && defender.model instanceof CreatureModel) {
          _.defer(() => {
            defender.destroy();
          });
        }
        defender.removeComponentDictionary(components);
      });
      done();
    };

    if (!!attackerPlayer) {
      attackerPlayer.attack(attack);
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
