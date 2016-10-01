import {Component} from '@angular/core';
import {AppState} from '../app.service';
import {Title} from './title';
import {PlayerCombatState} from '../../game/rpg/states/playerCombatState';
import {GameStateMachine} from '../../game/rpg/states/gameStateMachine';
import {GameStateModel} from '../../game/rpg/models/gameStateModel';
import {GameWorld} from '../../game/gameWorld';
import {registerWorld} from '../../game/pow-core/api';
import {Notify} from '../../game/ui/services/notify';
import {RPGGame} from '../../game/ui/services/rpgGame';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'home',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [
    Title
  ],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: ['./home.style.css'],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './home.template.html'
})
export class Home {
  // Set our default values
  localState = {value: ''};



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


  // TypeScript public modifiers
  constructor(public appState: AppState, public title: Title, public game: RPGGame, public notify: Notify) {
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

    console.log('hello `Home` component');
    // this.title.getData().subscribe(data => this.data = data);
  }

}
