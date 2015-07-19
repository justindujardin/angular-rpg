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

import * as rpg from '../game';
import {ItemModel,EntityModel} from './all';

export class UsableModel extends ItemModel {
  static DEFAULTS:rpg.IGameUsable = {
    name: "Invalid Item",
    icon: "",
    effects: [],
    cost: 0
  };

  /**
   * Simple "function" matching regex.  Matches form
   *
   * "cameCaseFunction2(args,here)"
   *
   * Use another regexp to break up the arguments.
   * @type {RegExp}
   */
  static FN_MATCHER:RegExp = /([a-z|A-Z|0-9]+)\((.*)\)/g;

  defaults():any {
    return _.extend(super.defaults(), UsableModel.DEFAULTS);
  }

  use(on:EntityModel):Promise<ItemModel> {
    return new Promise<ItemModel>((resolve, reject) => {
      var matches = UsableModel.FN_MATCHER.exec(this.attributes.effects);
      if (matches.length !== 3) {
        return reject('invalid effects expression: ' + this.attributes.effects);
      }
      var host:any = this;
      var delegate = host[matches[1]];
      if (!delegate) {
        return reject('invalid effect function in expression: ' + matches[0]);
      }
      console.warn("USING ITEM: " + this.attributes.name);
      delegate.call(this, on, matches[2]);
      resolve(this);
    });
  }


  // Usable Functions:

  heal(target:EntityModel, parameters:string) {
    console.warn("Healing  " + target.get('name'));
    var value = parseInt(parameters) || 0;
    if (value !== 0) {
      target.damage(-value);
    }
  }

}
