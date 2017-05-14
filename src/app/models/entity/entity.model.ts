import {BaseEntity, IHiddenAttributes} from '../base-entity';
import {ITemplateArmor, ITemplateWeapon} from '../game-data/game-data.model';
export type EntityType = 'warrior' | 'ranger' | 'mage' | 'healer' | 'npc';

/**
 * Define the slots available for equipping items on an Entity. Each slot
 * can be assigned a string itemId that corresponds to an item in the entity
 * collection.
 */
export interface EntitySlots {
  /** Entity id for the equipped weapon */
  readonly weapon?: string | null;
  /** Entity id for the equipped armor */
  readonly armor?: string | null;
  /** Entity id for the equipped boots */
  readonly boots?: string | null;
  /** Entity id for the equipped helm */
  readonly helm?: string | null;
  /** Entity id for the equipped shield */
  readonly shield?: string | null;
  /** Entity id for the equipped accessory */
  readonly accessory?: string | null;
}

export interface Entity extends BaseEntity, EntitySlots, IHiddenAttributes {
  readonly type: EntityType;
  readonly exp: number;
}

/**
 * When rendering UI elements it is very helpful to have an object with equipment resolved
 * to the underlying Item entities. This type represents that mapping. {@see getEntityEquipment} for
 * a store selector that returns this type.
 */
export interface EntityWithEquipment extends BaseEntity, IHiddenAttributes {
  readonly weapon?: ITemplateWeapon | null;
  /** Entity id for the equipped armor */
  readonly armor?: ITemplateArmor | null;
  /** Entity id for the equipped boots */
  readonly boots?: ITemplateArmor | null;
  /** Entity id for the equipped helm */
  readonly helm?: ITemplateArmor | null;
  /** Entity id for the equipped shield */
  readonly shield?: ITemplateArmor | null;
  /** Entity id for the equipped accessory */
  readonly accessory?: ITemplateArmor | null;
}
