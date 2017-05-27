import {JSONResource} from './json.resource';

describe('JSONResource', () => {
  it('should be defined', () => {
    expect(JSONResource).toBeDefined();
  });
  it('should succeed with good url', (done) => {
    new JSONResource()
      .fetch('assets/test/example.json')
      .then((res: JSONResource) => {
        expect(res.data.result).toBe('OK');
        done();
      });
  });
  it('should fail with bad url', (done) => {
    new JSONResource()
      .fetch('base/bad/does/not/exist.json')
      .catch(() => done());
  });
});
