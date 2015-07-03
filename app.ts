import {Component, View, bootstrap, NgFor, ElementRef} from 'angular2/angular2';

import {GameWorld} from 'source/gameWorld';
import {GameStateModel} from 'source/models/gameStateModel';
import {GameStateMachine} from 'source/states/gameStateMachine';

import {RPGGame,Notify,Animate} from 'source/ui/services/all';

import {RPGSprite} from 'source/ui/rpgsprite';
import {RPGNotification} from 'source/ui/rpgnotification';

import {PartyInventory} from 'source/ui/party/partyinventory';
import {PlayerCard} from 'source/ui/party/playercard';

import {WorldMap,WorldDialog,WorldStore,WorldTemple} from 'source/ui/world/all';

@Component({
  selector: 'rpg-app',
  appInjector: [RPGGame,Notify,Animate],
  properties: ['loaded']
})
@View({
  templateUrl: 'app.html',
  directives: [
    NgFor,
    WorldMap, WorldDialog, WorldStore, WorldTemple,
    PlayerCard,
    PartyInventory,
    RPGSprite, RPGNotification]
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
