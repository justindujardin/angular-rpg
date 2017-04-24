import {BaseEntity, IHiddenAttributes} from '../base-entity';
export type EntityType = 'warrior' | 'ranger' | 'mage' | 'healer' | 'npc';

export interface Entity extends BaseEntity, IHiddenAttributes {
  readonly type: EntityType;
  readonly exp: number;

}
