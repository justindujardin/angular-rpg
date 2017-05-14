import {BaseEntity, IHiddenAttributes} from '../base-entity';
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
