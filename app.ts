import {Component, View, bootstrap, NgFor, NgIf, ElementRef} from 'angular2/angular2';

import {GameWorld} from 'source/gameWorld';
import {GameStateModel} from 'source/models/gameStateModel';
import {GameStateMachine} from 'source/states/gameStateMachine';
import {PlayerCombatState} from 'source/states/playerCombatState';

import {RPGGame,Notify,Animate} from 'source/ui/services/all';

import {CombatMap,CombatDamage} from 'source/ui/combat/all';
import {RPGSprite,RPGHealthBar,RPGNotification} from 'source/ui/rpg/all';
import {PartyInventory,PlayerCard,PartyMenu} from 'source/ui/party/all';
import {WorldMap,WorldDialog,WorldStore,WorldTemple} from 'source/ui/world/all';

@Component({
  selector: 'rpg-app',
  appInjector: [RPGGame, Notify, Animate],
  properties: ['loaded', 'game', 'combat']
})
@View({
  templateUrl: 'app.html',
  directives: [
    NgFor, NgIf,
    WorldMap, WorldDialog, WorldStore, WorldTemple,
    CombatMap, CombatDamage,
    PlayerCard,
    PartyInventory, PartyMenu,
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
      game.machine.on('combat:begin', (state:PlayerCombatState) => this.combat = state);
      game.machine.on('combat:end', () => this.combat = null);
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
      bootstrap(RPGAppComponent);
      resolve();
    });
    world.events.once('error', (e)=> {
      reject(e);
    });
    pow2.registerWorld('rpg', world);
  });
}
