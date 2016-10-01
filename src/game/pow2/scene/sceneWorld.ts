/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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

import * as _ from 'underscore';
import {SpriteRender} from '../core/spriteRender';
import {PowInput} from '../core/input';
import {IScene} from '../interfaces/IScene';
import {World} from '../../pow-core/world';
import {ResourceLoader} from '../../pow-core/resourceLoader';

// TODO(JD): imagine this as a ngrx data store.
export class SceneWorld extends World {
  input: PowInput;
  sprites: SpriteRender;
  scene: IScene;

  constructor(services?: any) {
    super(_.defaults(services || {}, {
      loader: new ResourceLoader()
    }));
    this.setService('input', new PowInput());
    this.setService('sprites', new SpriteRender());
  }
}
