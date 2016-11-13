import {Being} from '../being';

export function isDefeated(test: Being) {
  return test.hp <= 0;
}
