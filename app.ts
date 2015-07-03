import {Component, View, bootstrap, NgFor, ElementRef} from 'angular2/angular2';

import {GameWorld} from 'source/gameWorld';
import {GameStateModel} from 'source/models/gameStateModel';
import {GameStateMachine} from 'source/states/gameStateMachine';

import {RPGGame} from 'source/ui/services/rpggame';
import {Notify} from 'source/ui/services/notify';
import {Animate} from 'source/ui/services/animate';

import {RPGSprite} from 'source/ui/rpgsprite';
import {RPGNotification} from 'source/ui/rpgnotification';
import {WorldMap} from 'source/ui/world/worldmap';
import {WorldDialog} from 'source/ui/world/worlddialog';
import {WorldStore} from 'source/ui/world/worldstore';

@Component({
  selector: 'rpg-app',
  appInjector: [RPGGame,Notify,Animate],
  properties: ['loaded']
})
@View({
  templateUrl: 'app.html',
  directives: [NgFor, WorldMap, WorldDialog, WorldStore, RPGSprite, RPGNotification]
})
export class RPGAppComponent {
  maps:string[] = [
    'castle', 'crypt', 'fortress1',
    'fortress2', 'isle', 'keep',
    'lair', 'port', 'ruins', 'sewer',
    'tower1', 'tower2', 'tower3', 'town',
    'village', 'wilderness'
  ];
  mapName:string = 'town';
  loaded:boolean = true;
}

export function load():Promise<void> {
  return new Promise<void>((resolve, reject)=> {
    var world = new GameWorld({
      model: new GameStateModel(),
      state: new GameStateMachine()
    });
    world.events.once('ready', ()=> {
      bootstrap(RPGAppComponent);
      resolve();
    });
    world.events.once('error', (e)=> {
      reject(e);
    });
    pow2.registerWorld('rpg', world);
  });
}
