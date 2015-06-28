import {Component, View, bootstrap, NgFor} from 'angular2/angular2';
import {RPGGame} from 'source/ui/services/rpggame';
import {GameWorld} from 'source/gameWorld';

import {GameStateModel} from 'source/models/gameStateModel';
import {GameStateMachine} from 'source/states/gameStateMachine';

import {RPGSprite} from 'source/ui/rpgsprite';
import {WorldMap} from 'source/ui/world/worldmap';
import {WorldDialog} from 'source/ui/world/worlddialog';

@Component({
  selector: 'rpg-app',
  appInjector: [RPGGame],
  properties: ['loaded']
})
@View({
  templateUrl: 'app.html',
  directives: [NgFor,WorldMap,WorldDialog,RPGSprite]
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
  return new Promise<void>((resolve,reject)=>{
    var world = new GameWorld({
      model: new GameStateModel(),
      state: new GameStateMachine()
    });
    world.events.once('ready',()=>{
      bootstrap(RPGAppComponent);
      resolve();
    });
    world.events.once('error',(e)=>{
      reject(e);
    });
    pow2.registerWorld('rpg',world);
  });
}
