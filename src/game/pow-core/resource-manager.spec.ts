import {Resource} from './resource';
import {ResourceManager} from './resource-manager';
import {errors} from './errors';
import {ServicesModule} from '../../app/services/index';
import {TestBed} from '@angular/core/testing';
import {rootReducer} from '../../app/models/index';
import {StoreModule} from '@ngrx/store';
declare const _: any;

class MockResource extends Resource {
  load(data?: boolean): Promise<MockResource> {
    return Promise.resolve(this);
  }

  fetch(shouldFailAsString?: string): Promise<MockResource> {
    return Promise.resolve(this);
  }
}

class MockFailResource extends Resource {
  load(data?: boolean): Promise<MockFailResource> {
    return Promise.reject('failResource load always rejects');
  }

  fetch(shouldFailAsString?: string): Promise<MockResource> {
    return Promise.reject('failResource fetch always rejects');
  }
}

describe('ResourceManager', () => {

  beforeEach(() => {
    return TestBed.configureTestingModule({
      imports: [StoreModule.provideStore(rootReducer), ServicesModule.forRoot()]
    });
  });

  let loader: ResourceManager;
  beforeEach(() => {
    loader = TestBed.get(ResourceManager);
  });

  it('should be defined and instantiable', () => {
    expect(loader).not.toBeNull();
  });

  describe('create', () => {
    it('should throw error if create is called with invalid args', () => {
      expect(() => {
        loader.create('this is not a constructor' as any, null);
      }).toThrow(new Error(errors.INVALID_ARGUMENTS));
    });

    it('should resolve promise when resource loads properly', (done) => {
      loader
        .create<MockResource>(MockResource)
        .load()
        .then(() => done());
    });

    it('should reject promise when resource fails to load', (done) => {
      loader
        .create<MockFailResource>(MockFailResource)
        .load()
        .catch(() => done());
    });
  });

  describe('loadAsType', () => {
    it('should allow specifying resource type explicitly', (done) => {
      loader
        .loadAsType<MockResource>('something', MockResource)
        .catch(console.error.bind(console))
        .then(() => done());
    });
    it('should reject with error if not given a source', (done) => {
      loader
        .loadAsType<MockResource>(null, MockResource)
        .catch(() => done());
    });
    it('should reject with error if not given a type to load as', (done) => {
      loader
        .loadAsType<MockResource>('something', null)
        .catch(() => done());
    });
  });

  describe('load', () => {
    it('should fail with unknown resource type', (done) => {
      loader.load<MockResource>('something.unknown').catch(() => done());
    });
    it('should cache loaded resources', (done) => {
      loader.registerType('mock', MockResource);
      loader.load('made-up.mock').then((resources: any[]) => {
        resources[0]._marked = 1337;
        // Ensure the same resource is returned, indicating that it
        // was retrieved from the cache.
        loader.load('made-up.mock').then((cachedResources: any[]) => {
          expect(cachedResources[0]._marked).toBe(1337);
          done();
        });
      });
    });

    it('should load an array of resources', (done) => {
      loader.registerType('mock', MockResource);
      loader
        .load<MockResource[]>(['made-up.mock', 'two.mock'])
        .then((resources: any) => {
          expect(resources.length).toBe(2);
          done();
        });
    });
  });

  describe('registerType', () => {
    it('should register custom types', (done) => {
      loader.registerType('mock', MockResource);
      loader.load('made-up.mock').then(() => done());
    });
  });

  describe('getResourceExtension', () => {
    it('should return file extensions for a given url', () => {
      const expectations: Array<[string, string]> = [
        ['png', 'foo.png'],
        ['png', 'http://www.website.com/foo.png'],
        ['', 'http://www.website.com/foo'],
        ['', 'foo/bar']
      ];
      for (let i: number = 0; i < expectations.length; i++) {
        const tuple: [string, string] = expectations[i];
        expect(loader.getResourceExtension(tuple[1])).toBe(tuple[0]);
      }
    });
  });

});
