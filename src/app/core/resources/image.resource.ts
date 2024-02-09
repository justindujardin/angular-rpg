import { assertTrue } from '../../models/util';
import { Resource } from '../resource';
/**
 * Use html image element to load an image resource.
 */
export class ImageResource extends Resource {
  data: HTMLImageElement;

  fetch(url?: string): Promise<ImageResource> {
    this.url = url || this.url;
    return new Promise<ImageResource>((resolve, reject) => {
      assertTrue(this.url, `ImageResource.load - invalid url :${this.url}`);
      const reference: HTMLImageElement = new Image();
      reference.onload = () => {
        this.data = reference;
        resolve(this);
      };
      reference.onerror = (err: any) => {
        reject(err);
      };
      reference.src = this.url;
    });
  }
}
