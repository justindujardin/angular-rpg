import {Component, View, bootstrap, NgFor, NgIf, ElementRef} from 'angular2/angular2';

import {GameWorld} from './gameWorld';
import {GameStateModel} from './models/gameStateModel';
import {GameStateMachine} from './states/gameStateMachine';
import {PlayerCombatState} from './states/playerCombatState';

import {RPGGame,Notify,Animate} from './ui/services/all';

import {CombatMap,CombatDamage} from './ui/combat/all';
import {RPGSprite,RPGHealthBar,RPGNotification} from './ui/rpg/all';
import {PartyInventory,PlayerCard,PartyMenu} from './ui/party/all';
import {WorldMap,WorldDialog,WorldStore,WorldTemple} from './ui/world/all';

import * as md from './ui/material/components/all';

@Component({
  selector: 'rpg-app',
  hostInjector: [RPGGame, Notify, Animate],
  properties: ['loaded', 'game', 'combat']
})
@View({
  templateUrl: 'source/app.html',
  directives: [
    NgFor, NgIf,
    WorldMap, WorldDialog, WorldStore, WorldTemple,
    CombatMap, CombatDamage,
    PlayerCard,
    PartyInventory, PartyMenu,
    md.MdProgressLinear, md.MdButton,
    RPGSprite, RPGNotification, RPGHealthBar]
})
export class RPGAppComponent {
  maps:string[] = [
    'castle', 'crypt', 'fortress1',
    'fortress2', 'isle', 'keep',
    'lair', 'port', 'ruins', 'sewer',
    'tower1', 'tower2', 'tower3', 'town',
    'village', 'wilderness'
  ];
  loaded:boolean = true;

  setMap(value:string) {
    this.game.partyPosition.zero();
    this.game.partyMapName = value;
  }

  combat:PlayerCombatState = null;

  constructor(public game:RPGGame) {
    game.initGame().then(()=> {
      game.machine.on('combat:begin', (state:PlayerCombatState) => {
        this.game.world.scene.paused = true;
        this.combat = state;
      });
      game.machine.on('combat:end', () => {
        this.game.world.scene.paused = false;
        this.combat = null;
      });
      console.log("Game fully initialized.");
    }).catch(console.error.bind(console));
  }
}

export function load():Promise<void> {
  return new Promise<void>((resolve, reject)=> {
    var world = new GameWorld({
      model: new GameStateModel(),
      state: new GameStateMachine()
    });
    world.events.once('ready', ()=> {
      try{
        bootstrap(RPGAppComponent);
        resolve();
      }
      catch(e){
        reject(e);
      }
    });
    world.events.once('error', reject);
    pow2.registerWorld('rpg', world);
  });
}
