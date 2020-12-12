import { EntityStatuses, EntityType, IEnemy, IPartyMember } from './base-entity';
import { ItemElements, ItemGroups, ITemplateWeapon } from './game-data/game-data.model';

export class Warrior implements IPartyMember {
  eid: 'warrior-123';
  id: 'warrior';
  type: 'warrior' = 'warrior';
  name: string = 'Gerald';
  icon: string = 'warrior-male.png';
  status: EntityStatuses[] = [];
  level: number = 1;
  exp: number = 0;
  hp: number = 35;
  maxhp: number = 35;
  mp: number = 0;
  maxmp: number = 0;
  strength: number[] = [20];
  agility: number[] = [5];
  intelligence: number[] = [1];
  vitality: number[] = [10];
  luck: number[] = [5];
  hitpercent: number[] = [10, 3];
  magicdefense: number[] = [15, 3];
}

export class Ranger implements IPartyMember {
  eid: 'ranger-123';
  id: 'ranger';
  name: string = 'Shivon';
  icon: string = 'ranger-female.png';
  type: 'ranger' = 'ranger';
  level: number = 1;
  status: EntityStatuses[] = [];
  exp: number = 0;
  hp: number = 30;
  maxhp: number = 30;
  mp: number = 0;
  maxmp: number = 0;
  strength: number[] = [3];
  agility: number[] = [10];
  intelligence: number[] = [5];
  vitality: number[] = [5];
  luck: number[] = [15];
  hitpercent: number[] = [22, 2];
  magicdefense: number[] = [15, 2];
}

export class Mage implements IPartyMember {
  eid: 'mage-123';
  id: 'mage';
  name: string = 'Herrah';
  icon: string = 'mage-female.png';
  type: 'mage' = 'mage';
  level: number = 1;
  status: EntityStatuses[] = [];
  exp: number = 0;
  hp: number = 25;
  maxhp: number = 25;
  mp: number = 0;
  maxmp: number = 0;
  strength: number[] = [1];
  agility: number[] = [10];
  intelligence: number[] = [20];
  vitality: number[] = [1];
  luck: number[] = [10];
  hitpercent: number[] = [5, 1];
  magicdefense: number[] = [20, 2];
}

export class Club implements ITemplateWeapon {
  type: 'weapon';
  icon: string = 'club.png';
  attack: number = 5;
  hit: number = 2;
  value: number = 25;
  name: string = 'Club';
  level: number = 1;
  usedby?: EntityType[] = ['warrior', 'ranger'];
  elements?: ItemElements[] = [];
  groups?: ItemGroups[] = [];
  id: string = 'club';
}

export class Slingshot implements ITemplateWeapon {
  type: 'weapon';
  icon: string = 'sling.png';
  attack: number = 5;
  hit: number = 10;
  value: number = 25;
  name: string = 'Slingshot';
  level: number = 1;
  usedby?: EntityType[] = ['warrior', 'ranger'];
  elements?: ItemElements[] = [];
  groups?: ItemGroups[] = [];
  id: string = 'slingshot';
}

export class Staff implements ITemplateWeapon {
  type: 'weapon';
  icon: string = 'shortStaff.png';
  attack: number = 6;
  hit: number = 0;
  value: number = 25;
  name: string = 'Short Staff';
  level: number = 1;
  usedby?: EntityType[] = ['warrior', 'ranger'];
  elements?: ItemElements[] = [];
  groups?: ItemGroups[] = [];
  id: string = 'short-staff';
}

export class Imp implements IEnemy {
  eid: string = 'imp-1231313';
  id: string = 'imp';
  name: string = 'imp';
  level: number = 1;
  status: EntityStatuses[] = [];
  icon: string = 'imp.png';
  exp: number = 6;
  gold: number = 6;
  hp: number = 8;
  maxhp: number = 8;
  mp: number = 0;
  attack: number = 4;
  defense: number = 4;
  magicdefense: number = 16;
  hitpercent: number = 2;
}
