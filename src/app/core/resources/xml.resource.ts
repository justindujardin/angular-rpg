import * as $ from 'jquery';
import * as _ from 'underscore';
import { Resource } from '../resource';

/**
 * Use jQuery to load an XML file from a URL.
 */
export class XMLResource extends Resource {
  data: JQuery<Node>;

  fetch(url: string): Promise<XMLResource> {
    this.url = url || this.url;
    if (!url) {
      return Promise.reject(`XMLResource: invalid url: ${url}`);
    }
    return new Promise<XMLResource>((resolve, reject) => {
      const request: JQueryXHR = $.get({
        url: url,
        dataType: 'text',
      });
      request.done((object: string) => {
        this.data = $($.parseXML(object).getRootNode());
        this.load(this.data).then(resolve).catch(reject);
      });
      request.fail((jqxhr, settings, exception) => {
        reject(exception);
      });
    });
  }

  /**
   * Load from a given piece of data.
   */
  load(data: any): Promise<XMLResource> {
    return Promise.resolve<XMLResource>(this);
  }

  getRootNode(tag: string) {
    if (!this.data) {
      return null;
    }
    const target: any = this.data[0];
    if (target && target.tagName === tag) {
      return this.data[0];
    }
    return $(this.data).find(tag);
  }

  getChildren<T>(el: any, tag: string): T[] {
    const list = el.find(tag);
    return _.compact(
      _.map(list, (c: any) => {
        const child: any = $(c);
        return (child.parent()[0] !== el[0] ? null : child) as T;
      }),
    );
  }

  getChild<T>(el: any, tag: string): T {
    return this.getChildren(el, tag)[0] as T;
  }

  getElAttribute(el: any, name: string) {
    if (el) {
      const attr = el.attr(name);
      if (attr) {
        return attr;
      }
    }
    return null;
  }
}
