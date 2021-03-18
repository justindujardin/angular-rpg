/*
 Copyright (C) 2013-2020 by Justin DuJardin and Contributors

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
import { errors } from './errors';

export interface IResource {
  url: string;
  data: any;
  extension: string;
  fetch(url?: string): Promise<IResource>;
  load(data?: any): Promise<IResource>;
}

/**
 * Promise based resource loading class. Loads from given URL or data.
 */
export class Resource implements IResource {
  extension: string;

  constructor(public url: string = null, public data: any = null) {}

  load(data?: any): Promise<Resource> {
    return Promise.reject(errors.CLASS_NOT_IMPLEMENTED);
  }

  fetch(url?: string): Promise<Resource> {
    return Promise.reject(errors.CLASS_NOT_IMPLEMENTED);
  }
}
