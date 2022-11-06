import { AudioResource } from './audio.resource';

describe('AudioResource', () => {
  it('should be defined', () => {
    expect(AudioResource).toBeDefined();
  });
  it('should succeed with good url', (done) => {
    new AudioResource().fetch('assets/test/tele.wav').then((err) => {
      expect(err).toBeDefined();
      done();
    });
  });
  it('should fail with bad url', (done) => {
    new AudioResource().fetch('base/bad/does/not/exist').catch((err) => {
      expect(err).toBeDefined();
      done();
    });
  });
  it('should fail with bad url if extension is specified', (done) => {
    new AudioResource().fetch('base/bad/does/not/exist.wav').catch((err) => {
      expect(err).toBeDefined();
      done();
    });
  });
});
