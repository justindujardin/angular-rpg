import {Behavior} from './behavior';
import {BehaviorHost} from './behavior-host';
import {errors} from './errors';

class TestBehaviorNamed extends Behavior {
  constructor(public name: string) {
    super();
  }
}
class TestBehaviorBoolean extends Behavior {
  constructor(public value: boolean) {
    super();
  }
}
class TestBehaviorConnecting extends Behavior {
  constructor(public willConnect: boolean) {
    super();
  }

  connectBehavior(): boolean {
    return this.willConnect;
  }
}
class TestBehaviorDisconnecting extends Behavior {
  constructor(public willDisconnect: boolean) {
    super();
  }

  disconnectBehavior(): boolean {
    return this.willDisconnect;
  }
}
class TestBehaviorSynchronize extends Behavior {
  public syncCalls: number = 0;

  resetCalls() {
    this.syncCalls = 0;
  }

  syncBehavior(): boolean {
    this.syncCalls++;
    return super.syncBehavior();
  }
}

describe('BehaviorHost', () => {
  it('is defined', () => expect(BehaviorHost).toBeDefined());

  // Build an entity and allocate and add a set of components to it.
  function entityWithBehaviors(types: Behavior[]): BehaviorHost {
    const entity: BehaviorHost = new BehaviorHost();
    types.forEach((c: Behavior) => entity.addBehavior(c));
    return entity;
  }

  it('findBehavior finds a single component by a given type', () => {
    const e: BehaviorHost = entityWithBehaviors([
      new TestBehaviorNamed('comp1')
    ]);
    expect(e.findBehavior(TestBehaviorNamed).name).toBe('comp1');
    expect(e.findBehavior(TestBehaviorBoolean)).toBeNull();
  });

  it('findBehaviors finds all components with a given type', () => {
    const e: BehaviorHost = entityWithBehaviors([
      new TestBehaviorNamed('comp1'),
      new TestBehaviorNamed('comp2'),
    ]);
    expect(e.findBehaviors(TestBehaviorNamed).length).toBe(2);
    expect(e.findBehaviors(TestBehaviorBoolean).length).toBe(0);
  });

  it('findBehaviorByName finds components by name', () => {
    const e: BehaviorHost = entityWithBehaviors([
      new TestBehaviorNamed('comp1'),
      new TestBehaviorNamed('comp2')
    ]);
    expect(e._connectedBehaviors.length).toBe(2);
    expect(e.findBehaviorByName('comp1')).not.toBeNull();
    expect(e.findBehaviorByName('comp2')).not.toBeNull();
    expect(e.findBehaviorByName('comp3')).toBeNull();
  });

  describe('addBehavior', () => {
    it('registers components with this object as the host', () => {
      const c: Behavior = new TestBehaviorBoolean(false);
      const e: BehaviorHost = entityWithBehaviors([c]);
      expect(e._connectedBehaviors.length).toBe(1);
      expect(c.host.id).toBe(e.id);
    });
    it('throws an error when adding the same component twice', () => {
      const c: Behavior = new TestBehaviorBoolean(false);
      const e: BehaviorHost = entityWithBehaviors([c]);
      expect(e._connectedBehaviors.length).toBe(1);
      // throw
      expect(() => e.addBehavior(c)).toThrow(new Error(errors.ALREADY_EXISTS));
    });
    it('does not add a component it returns false from connectBehavior()', () => {
      const c: Behavior = new TestBehaviorConnecting(false);
      const e: BehaviorHost = new BehaviorHost();
      expect(e.addBehavior(c)).toBe(false);
      expect(e._connectedBehaviors.length).toBe(0);
    });
    it('calls syncBehavior() on all components when a new component is added', () => {
      const c: TestBehaviorSynchronize = new TestBehaviorSynchronize();
      const e: BehaviorHost = new BehaviorHost();
      expect(c.syncCalls).toBe(0);
      expect(e.addBehavior(c)).toBe(true);
      expect(c.syncCalls).toBe(1);
    });
    it('does not call syncBehavior() on components when silent parameter is true', () => {
      const c: TestBehaviorSynchronize = new TestBehaviorSynchronize();
      const e: BehaviorHost = new BehaviorHost();
      expect(c.syncCalls).toBe(0);
      expect(e.addBehavior(c, true)).toBe(true);
      expect(c.syncCalls).toBe(0);
    });
  });

  describe('removeBehavior', () => {
    it('removes a component by instance', () => {
      const c = new TestBehaviorBoolean(false);
      const e: BehaviorHost = entityWithBehaviors([c]);
      expect(e._connectedBehaviors.length).toBe(1);
      expect(e.removeBehavior(c)).toBe(true);
      expect(e.removeBehavior(c)).toBe(false);
    });
    it('fails to remove a component that it does not host', () => {
      const c = new TestBehaviorBoolean(false);
      const d = new TestBehaviorBoolean(false);
      const e: BehaviorHost = entityWithBehaviors([d]);
      expect(e.removeBehavior(c)).toBe(false);
      expect(e.removeBehavior(d)).toBe(true);
    });
    it('fails to disconnect a component that returns false from disconnectBehavior()', () => {
      const c = new TestBehaviorDisconnecting(false);
      const e: BehaviorHost = entityWithBehaviors([c]);
      expect(e._connectedBehaviors.length).toBe(1);
      expect(e.removeBehavior(c)).toBe(false);
    });

    it('calls syncBehavior() on all components when a new component is added', () => {
      const c = new TestBehaviorSynchronize();
      const d = new TestBehaviorBoolean(true);
      const e: BehaviorHost = entityWithBehaviors([c, d]);
      c.resetCalls();
      expect(e.removeBehavior(d)).toBe(true);
      expect(c.syncCalls).toBe(1);
    });
    it('does not call syncBehavior() on components when silent parameter is true', () => {
      const c = new TestBehaviorSynchronize();
      const d = new TestBehaviorBoolean(true);
      const e: BehaviorHost = entityWithBehaviors([c, d]);
      c.resetCalls();
      expect(e.removeBehavior(d, true)).toBe(true);
      expect(c.syncCalls).toBe(0);
    });

  });
  describe('removeBehaviorByType', () => {
    it('removes a component by type', () => {
      const c = new Behavior();
      const e: BehaviorHost = entityWithBehaviors([c]);
      expect(e.removeBehaviorByType(Behavior)).toBe(true);
    });
    it('fails to remove a component by type when it has none', () => {
      const d = new Behavior();
      const e: BehaviorHost = entityWithBehaviors([d]);
      expect(e.removeBehaviorByType(TestBehaviorBoolean)).toBe(false);
    });
    it('calls syncBehavior() on all components when a new component is added', () => {
      const c = new TestBehaviorSynchronize();
      const d = new TestBehaviorBoolean(true);
      const e: BehaviorHost = entityWithBehaviors([c, d]);
      c.resetCalls();
      expect(e.removeBehaviorByType(TestBehaviorBoolean)).toBe(true);
      expect(c.syncCalls).toBe(1);
    });
    it('does not call syncBehavior() on components when silent parameter is true', () => {
      const c = new TestBehaviorSynchronize();
      const d = new TestBehaviorBoolean(true);
      const e: BehaviorHost = entityWithBehaviors([c, d]);
      c.resetCalls();
      expect(e.removeBehaviorByType(TestBehaviorBoolean, true)).toBe(true);
      expect(c.syncCalls).toBe(0);
    });
  });

});
