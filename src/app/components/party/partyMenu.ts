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

import {Component, ViewEncapsulation} from '@angular/core';
import {RPGGame, Notify} from '../../services/index';

const template = require('./partyMenu.html') as string;

@Component({
  selector: 'party-menu',
  inputs: ['game', 'page', 'open'],
  styleUrls: ['./partyMenu.scss'],
  template: template
})
export class PartyMenu {
  page: string = 'party';
  open: boolean = false;

  toggle() {
    this.open = !this.open;
  }

  getActiveClass(type: string): any {
    return {
      active: type === this.page
    };
  }

  showParty() {
    this.page = 'party';
  }

  showSave() {
    this.page = 'save';
  }

  showInventory() {
    this.page = 'inventory';
  }

  menuResetGame() {
    this.game.resetGame();
    this.notify.show('Game data deleted.  Next time you refresh you will begin a new game.');
  }

  menuSaveGame() {
    this.game.saveGame();
    this.notify.show('Game state saved!  Nice.');
  }

  constructor(public game: RPGGame, public notify: Notify) {

  }

}
