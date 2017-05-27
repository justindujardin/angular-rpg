import {IWorld, IWorldObject, World} from './world';
class WorldObject implements IWorldObject {
  world: IWorld;
}
class WorldObjectWithCallbacks implements IWorldObject {
  world: IWorld = null;
  added: boolean = false;

  onAddToWorld(world: IWorld) {
    this.added = true;
  }

  onRemoveFromWorld(world: IWorld) {
    this.added = false;
  }

}
describe('World', () => {
  it('is defined', () => expect(World).toBeDefined());

  it('initializes with static shared time manager by default', () => {
    const world = new World();
    expect(world.time).toBeDefined();
  });

  it('allows overriding services after construction', () => {
    const world = new World();
    const override: any = {
      key: 'foo'
    };
    world.setService('loader', override);
    expect(((world as any).loader).key).toBe('foo');
  });

  describe('mark', () => {
    it('calls onAddToWorld for objects that specify implement it', () => {
      const object = new WorldObjectWithCallbacks();
      expect(object.added).toBe(false);
      const world = new World();
      world.mark(object);
      expect(object.added).toBe(true);
    });
    it('does not explode with object that does not implement onAddToWorld', () => {
      const object = new WorldObject();
      const world = new World();
      world.mark(object);
    });
    it('does not explode with bad input', () => {
      const world = new World();
      world.mark(null);
    });
  });

  describe('erase', () => {
    it('calls onRemoveFromWorld for objects that specify implement it', () => {
      const object = new WorldObjectWithCallbacks();
      expect(object.added).toBe(false);
      const world = new World();
      world.mark(object);
      expect(object.added).toBe(true);
      world.erase(object);
      expect(object.added).toBe(false);
    });
    it('does not explode with object that does not implement onAddToWorld', () => {
      const object = new WorldObject();
      const world = new World();
      world.erase(object);
    });
    it('does not explode with bad input', () => {
      const world = new World();
      world.erase(null);
    });
  });

});
