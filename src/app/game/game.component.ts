import {Component, ViewEncapsulation} from '@angular/core';
import {PlayerCombatState} from '../../game/rpg/states/playerCombatState';
import {Notify} from '../../game/ui/services/notify';
import {RPGGame} from '../../game/ui/services/rpgGame';
import {Animate} from '../../game/ui/services/animate';

@Component({
  selector: 'game',
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [
    RPGGame,
    Notify,
    Animate
  ],
  styleUrls: ['./game.style.scss'],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './game.template.html'
})
export class Game {
  maps: string[] = [
    'castle', 'crypt', 'fortress1',
    'fortress2', 'isle', 'keep',
    'lair', 'port', 'ruins', 'sewer',
    'tower1', 'tower2', 'tower3', 'town',
    'village', 'wilderness'
  ];
  loaded: boolean = true;

  setMap(value: string) {
    this.game.partyPosition.zero();
    this.game.partyMapName = value;
  }

  combat: PlayerCombatState = null;

  constructor(public game: RPGGame, public notify: Notify) {
  }

  ngOnInit() {
    this.game.initGame().then((newGame: boolean) => {
      this.game.machine.on('combat:begin', (state: PlayerCombatState) => {
        this.game.world.scene.paused = true;
        this.combat = state;
      });
      this.game.machine.on('combat:end', () => {
        this.game.world.scene.paused = false;
        this.combat = null;
      });
      console.log("Game fully initialized.");
      if (newGame) {
        var msgs: string[] = [
          'Urrrrrgh.', 'What is this?',
          'Why am I facing a wall in a strange town?',
          'Oh well, it is probably not important.',
          'I better take a look around',
        ];
        msgs.forEach((m: string) => this.notify.show(m, null, 0));
      }
    }).catch(console.error.bind(console));
  }

}
