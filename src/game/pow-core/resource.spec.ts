import {Resource} from './resource';

describe('Resource', () => {
  it('should be defined', () => {
    expect(Resource).toBeDefined();
  });
  it('should require load to be implemented in a subclass', (done) => {
    new Resource().fetch('/bad/url').catch(() => done());
  });
});
