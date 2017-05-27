/*
 Copyright (C) 2013-2015 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import {Resource} from '../resource';
import * as _ from 'underscore';
import * as $ from 'jquery';

/**
 * Use jQuery to load an XML file from a URL.
 */
export class XMLResource extends Resource {
  data: any; // JQuery object

  fetch(url: string): Promise<XMLResource> {
    this.url = url || this.url;
    return new Promise<XMLResource>((resolve, reject) => {
      const request: any = $.get(this.url); // JQueryXHR
      request.done((object: XMLDocument) => {
        this.data = $(object);
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
    return $(_.find(this.data, (d: any) => {
      return d.tagName && d.tagName.toLowerCase() === tag;
    }));
  }

  getChildren<T>(el: any, tag: string): T[] {
    const list = el.find(tag);
    return _.compact(_.map(list, (c) => {
      const child: any = $(c);
      return (child.parent()[0] !== el[0] ? null : child) as T;
    }));
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
