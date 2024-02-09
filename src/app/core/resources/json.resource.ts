import * as $ from 'jquery';
import { assertTrue } from '../../models/util';
import { Resource } from '../resource';
/**
 * Use jQuery to load a JSON file from a URL.
 */
export class JSONResource extends Resource {
  data: any;

  fetch(url?: string): Promise<JSONResource> {
    this.url = url || this.url;
    return new Promise<JSONResource>((resolve, reject) => {
      assertTrue(this.url, `JSONResource.load - invalid url :${url}`);
      const request: any = $.getJSON(this.url);
      request.done((object: JSON) => {
        this.data = object;
        resolve(this);
      });
      request.fail((jqxhr: any, settings: any, exception: any) => {
        reject(exception);
      });
    });
  }
}
