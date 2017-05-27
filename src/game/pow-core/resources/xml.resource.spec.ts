import {XMLResource} from './xml.resource';

describe('XMLResource', () => {
  it('should be defined', () => {
    expect(XMLResource).toBeDefined();
  });
  it('should succeed with good url', (done) => {
    new XMLResource()
      .fetch('assets/test/example.xml')
      .then((res: XMLResource) => {
        expect(res.data.find('xml').text()).toBe('OK');
        done();
      });
  });
  it('should fail with bad url', (done) => {
    new XMLResource()
      .fetch('base/bad/does/not/exist.xml')
      .catch(() => done());
  });
});
