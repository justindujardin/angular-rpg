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

import {GameFeatureComponent} from '../gameFeatureComponent';


export class DialogFeatureComponent extends GameFeatureComponent {
  title:string;
  text:string;
  icon:string;

  syncComponent():boolean {
    if (!super.syncComponent() || !this.host.feature) {
      return false;
    }
    this.title = this.host.feature.title;
    this.text = this.host.feature.text;
    this.icon = this.host.feature.icon;
    return true;
  }

  enter(object:pow2.tile.TileObject):boolean {
    if (this.title && this.text) {
      object.scene.trigger('dialog:entered', this);
    }
    return true;
  }

  exit(object:pow2.tile.TileObject):boolean {
    if (this.title && this.text) {
      object.scene.trigger('dialog:exited', this);
    }
    return true;
  }

}

