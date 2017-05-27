import {AudioResource} from './audio.resource';

describe('AudioResource', () => {
  it('should be defined', () => {
    expect(AudioResource).toBeDefined();
  });
  it('should succeed with good url', (done) => {
    new AudioResource()
      .fetch('assets/test/tele')
      .then(() => done());
  });
  it('should accept explicit filename extension', (done) => {
    new AudioResource()
      .fetch('assets/test/tele.wav')
      .then(() => done());
  });
  it('should fail with bad url', (done) => {
    new AudioResource()
      .fetch('base/bad/does/not/exist')
      .catch(() => done());
  });
  it('should fail with bad url if extension is specified', (done) => {
    new AudioResource()
      .fetch('base/bad/does/not/exist.wav')
      .catch(() => done());
  });
});
