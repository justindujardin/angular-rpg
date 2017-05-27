import {ImageResource} from './image.resource';

describe('ImageResource', () => {
  it('should be defined', () => {
    expect(ImageResource).toBeDefined();
  });

  it('should succeed with good url', (done) => {
    new ImageResource()
      .fetch('assets/test/vezu.png')
      .then((res: ImageResource) => {
        expect(res.data.naturalWidth).toBe(16);
        expect(res.data.naturalHeight).toBe(16);
        done();
      });
  });
  it('should fail with bad url', (done) => {
    new ImageResource()
      .fetch('assets/test/invalidfile.png')
      .catch(() => done());
  });
});
