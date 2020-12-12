import { Behavior } from './behavior';

class _NamedBehavior extends Behavior {
  constructor(public name: string) {
    super();
  }
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
    it('returns the behavior name by default', () => {
      class NamedBehavior extends _NamedBehavior {}

      const c = new NamedBehavior('CoolBehavior');
      expect(c.toString()).toBe('CoolBehavior');
    });

    it('uses the constructor name when the behavior has no name property', () => {
      class NamedBehavior extends _NamedBehavior {}

      const c: any = new NamedBehavior(null);
      expect(c.toString()).toBe('NamedBehavior');
    });

    it('returns "Behavior" when all else fails', () => {
      class NamedBehavior extends _NamedBehavior {}

      const c: any = new NamedBehavior(null);
      delete c.constructor.name;
      let iter = c.constructor;
      while (iter && iter.__proto__) {
        delete iter.__proto__.name;
        iter = iter.__proto__;
      }
      c.constructor.toString = () => {
        return '';
      };
      expect(c.toString()).toBe('Behavior');
    });
  });
});
