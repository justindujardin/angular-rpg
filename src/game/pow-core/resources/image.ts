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
/**
 * Use html image element to load an image resource.
 */
export class ImageResource extends Resource {
  data: HTMLImageElement;

  fetch(url?: string): Promise<ImageResource> {
    this.url = url || this.url;
    return new Promise<ImageResource>((resolve, reject) => {
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
