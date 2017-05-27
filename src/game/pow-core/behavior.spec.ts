import {Behavior} from './behavior';

class NamedBehavior extends Behavior {

}
describe('Behavior', () => {
  it('is defined', () => expect(Behavior).toBeDefined());

  it('connectBehavior returns true by default', () => {
    const c = new Behavior();
    expect(c.connectBehavior()).toBe(true);
  });
  it('disconnectBehavior returns true by default', () => {
    const c = new Behavior();
    expect(c.disconnectBehavior()).toBe(true);
  });
  it('syncBehavior returns true by default', () => {
    const c = new Behavior();
    expect(c.syncBehavior()).toBe(true);
  });

  describe('string coercion', () => {
    it('returns a human readable class', () => {
      const c = new NamedBehavior();
      expect(c.toString()).toBe('NamedBehavior');
    });

    it('returns a readable class when constructor.name is missing', () => {
      const c: any = new NamedBehavior();
      delete c.constructor.name;
      expect(c.toString()).toBe('NamedBehavior');
    });

    it('returns instance name when all else fails', () => {
      const c: any = new NamedBehavior();
      c.name = 'NamedBehavior';
      delete c.constructor.name;
      c.constructor.toString = () => {
        return '';
      };
      expect(c.toString()).toBe('NamedBehavior');
    });
  });

});
