import { calculateDamage, PartyMechanics } from './mechanics';
import { Club, Imp, Ranger, Slingshot, Warrior } from './mechanics.mock';

// const url =
//   'https://docs.google.com/spreadsheets/d/1JK3NthX0O0-8BvJFTSMhngaioDbpa7qJiOlWI2H2RQ0/edit?usp=sharing';
// let res: GameDataResource = new GameDataResource();
// beforeAll((done) => {
//   res.fetch(url).then(() => done());
// });

describe('Game Mechanics', () => {
  describe('PartyMechanics', () => {
    describe('getAttack', () => {
      it('calculates total attack value with equipment bonuses', () => {
        const w = new Warrior();
        const halfStrength = w.strength[0] / 2;
        // With no weapons attack is half of strength
        expect(PartyMechanics.getAttack({ state: w })).toBe(halfStrength);
        // The weapon is additive
        const weapon = new Club();
        expect(PartyMechanics.getAttack({ state: w, equipment: [weapon] })).toBe(
          halfStrength + weapon.attack
        );
      });
    });
  });
  describe('calculateDamage', () => {
    it('warrior attacks an imp!', () => {
      const attacker = new Ranger();
      const weapons = [new Slingshot()];
      const imp = new Imp();
      for (let i = 0; i < 5; i++) {
        calculateDamage({
          attackerType: 'party',
          attacker,
          attackerWeapons: weapons,
          defender: imp,
          defenderType: 'enemy',
        });
      }
    });
  });
});
