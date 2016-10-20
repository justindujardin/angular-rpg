import {Component, ViewEncapsulation} from '@angular/core';
import {PlayerCombatState} from '../../../game/rpg/states/playerCombatState';
import {Notify} from '../../services/notify';
import {RPGGame} from '../../services/rpgGame';
import {GameWorld} from '../../services/gameWorld';

const template = require('./game.component.html');

@Component({
  selector: 'game',
  styleUrls: ['./game.component.scss'],
  encapsulation: ViewEncapsulation.None,
  template: template
})
export class GameComponent {
  combat: PlayerCombatState = null;
  constructor(public game: RPGGame, public notify: Notify, public world: GameWorld) {
  }

  ngOnInit() {
    this.game.initGame().then((newGame: boolean) => {
      this.game.machine.on('combat:begin', (state: PlayerCombatState) => {
        this.world.scene.paused = true;
        this.combat = state;
      });
      this.game.machine.on('combat:end', () => {
        this.world.scene.paused = false;
        this.combat = null;
      });
      console.log("Game fully initialized.");
      if (newGame) {
        var msgs: string[] = [
          'Urrrrrgh.', 'What is this?',
          'Why am I staring at a wall?',
          'Oh well, it is probably not important.',
          'I better take a look around'
        ];
        msgs.forEach((m: string) => this.notify.show(m, null, 0));
      }
    }).catch(console.error.bind(console));
  }

}
