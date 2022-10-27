import { ITileInstanceMeta } from './tiled';
import { TiledTSXResource } from './tiled-tsx.resource';
describe('TiledTSXResource', () => {
  it('should be defined', () => {
    expect(TiledTSXResource).toBeDefined();
  });

  it('should succeed with good url', (done) => {
    new TiledTSXResource()
      .fetch('assets/test/example.tsx')
      .then((resource: TiledTSXResource) => {
        // Name must reference a loadable sprite sheet image
        expect(resource.name).toBe('vezu.png');
        expect(resource.tiles[1].properties.passable).toBe(false);
        done();
      });
  });
  it('should fail with bad url', (done) => {
    new TiledTSXResource().fetch('bad/does/not/exist.tsx').catch((data) => {
      expect(data).toBeDefined();
      done();
    });
  });
  it('should fail with missing image source', (done) => {
    new TiledTSXResource().fetch('assets/test/badImage.tsx').catch((data) => {
      expect(data).toBeDefined();
      done();
    });
  });

  describe('getTileMeta', () => {
    it('should return metadata about a tile by global id', (done) => {
      new TiledTSXResource()
        .fetch('assets/test/example.tsx')
        .then((resource: TiledTSXResource) => {
          const meta: ITileInstanceMeta = resource.getTileMeta(1);
          expect(meta).not.toBeNull();
          expect(meta.properties?.passable).toBeFalse();
          done();
        });
    });
  });
});
