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

import {Component, View, NgIf, onDestroy} from 'angular2/angular2';
import {GameFeatureObject} from '../../objects/gameFeatureObject';
import {DialogFeatureComponent} from '../../components/features/dialogFeatureComponent';
import {RPGGame} from '../services/all';
import {RPGSprite} from '../rpg/all';

@Component({
  selector: 'world-dialog',
  properties: ['text', 'title', 'icon', 'active'],
  lifecycle: [onDestroy]
})
@View({
  templateUrl: 'source/ui/world/worlddialog.html',
  directives: [RPGSprite, NgIf]
})
export class WorldDialog {

  static DEFAULT_TEXT:string = 'Nothing to see here';
  static DEFAULT_TITLE:string = 'Untitled';

  text:string = WorldDialog.DEFAULT_TEXT;
  title:string = WorldDialog.DEFAULT_TITLE;
  icon:string = '';
  active:boolean = false;

  constructor(public game:RPGGame) {
    // Dialog bubbles
    game.world.scene.on('dialog:entered', (feature:DialogFeatureComponent) => {
      this.active = true;
      this.icon = feature.icon;
      this.text = feature.text;
      this.title = feature.title;
    }, this);
    game.world.scene.on('dialog:exited', () => {
      this.active = false;
      this.text = WorldDialog.DEFAULT_TEXT;
      this.title = WorldDialog.DEFAULT_TITLE;
      this.icon = '';
    }, this);
  }

  onDestroy() {
    this.game.world.scene.off('dialog:entered', null, this);
    this.game.world.scene.off('dialog:exited', null, this);
  }
}
