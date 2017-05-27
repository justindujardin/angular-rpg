import {TiledTMXResource} from './tiled-tmx.resource';
import {ITiledLayer, ITiledObject} from './tiled.model';
import * as $ from 'jquery';

describe('TiledTMXResource', () => {
  it('should be defined', () => {
    expect(TiledTMXResource).toBeDefined();
  });

  it('should succeed with good url', (done) => {

    new TiledTMXResource()
      .fetch('assets/test/example.tmx')
      .then((resource: TiledTMXResource) => {
        const tileSize: number = 16;
        expect(resource.height).toBe(4);
        expect(resource.width).toBe(4);
        expect(resource.tilewidth).toBe(tileSize);
        expect(resource.tileheight).toBe(tileSize);
        expect(resource.layers.length).toBe(2);
        done();
      });
  });

  it('should keep reference to original xml elements', (done) => {
    new TiledTMXResource()
      .fetch('assets/test/example.tmx')
      .then((resource: TiledTMXResource) => {
        expect(resource.layers.length).toBe(2);
        done();
      });
  });

  it('should extract layer data from map', (done) => {
    new TiledTMXResource()
      .fetch('assets/test/example.tmx')
      .then((resource: TiledTMXResource) => {
        const layer: ITiledLayer = resource.layers[0];
        expect(layer.name).toBe('TestLayer');
        done();
      });
  });

  it('should extract objectgroup data from map', (done) => {
    new TiledTMXResource()
      .fetch('assets/test/example.tmx')
      .then((resource: TiledTMXResource) => {
        const objectLayer: ITiledLayer = resource.layers[1];
        expect(objectLayer.objects.length).toBe(2);
        expect(objectLayer.color).toBe('#000000');
        const object: ITiledObject = objectLayer.objects[0];
        expect(object.properties).toBeDefined();
        expect(object.properties.result).toBe('OK');
        expect(object.name).toBe('example');
        done();
      });
  });

  it('should serialize to xml with same data as when loaded', (done) => {
    // Load the example file, serialize to XML and reload a new resource with the
    // data.  Compare the two loaded resource properties as expected.
    new TiledTMXResource()
      .fetch('assets/test/example.tmx')
      .then((resource: TiledTMXResource) => {
        // Ensure sane data to compare.
        const l1: ITiledLayer = resource.layers[1];
        const o1: ITiledObject = l1.objects[0];

        expect(l1.color).toBe('#000000');
        expect(o1.properties).toBeDefined();
        expect(o1.properties.result).toBe('OK');
        expect(o1.name).toBe('example');
        expect(o1.type).toBe('box');

        const xmlStr: string = resource.write();
        // Serialize as an XML string, and deserialize into object form.
        // Test this rather than XML string comparisons to be less fragile.
        const xml = $(xmlStr);
        new TiledTMXResource('assets/test/example.tmx', xml).load().then((clone: TiledTMXResource) => {
          // Layer data
          expect(clone.layers[0].data).toEqual(resource.layers[0].data);

          // Object layer comparisons
          const l2: ITiledLayer = clone.layers[1];
          const o2: ITiledObject = l2.objects[0];

          expect(l1.objects.length).toBe(l2.objects.length);
          expect(l1.color).toBe(l2.color);

          expect(o2.properties).toBeDefined();
          expect(o2.properties.result).toBe(o1.properties.result);
          expect(o2.name).toBe(o1.name);
          expect(o2.type).toBe(o1.type);

          done();
        });
      });
  });

  it('should fail with bad url', (done) => {
    new TiledTMXResource()
      .fetch('bad/does/not/exist.tmx')
      .catch(() => done());
  });

  it('should fail with missing image source', (done) => {
    new TiledTMXResource()
      .fetch('assets/test/badImage.tmx')
      .catch(() => done());
  });

  it('should fail with non-csv encoded layer data', (done) => {
    new TiledTMXResource()
      .fetch('assets/test/badEncoding.tmx')
      .catch(() => done());
  });

});
