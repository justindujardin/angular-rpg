import {Component, View, bootstrap, NgFor} from 'angular2/angular2';
import {RPGGame} from 'source/ui/services/rpggame';
import {WorldMap} from 'source/ui/worldmap/worldmap';

@Component({
  selector: 'rpg-app',
  appInjector: [RPGGame],
  properties: ['loaded']
})
@View({
  templateUrl: 'app.html',
  directives: [NgFor,WorldMap]
})
export class RPGAppComponent {
  maps:string[] = [
    'castle', 'crypt', 'fortress1',
    'fortress2', 'isle', 'keep',
    'lair', 'port', 'ruins', 'sewer',
    'tower1', 'tower2', 'tower3', 'town',
    'village', 'wilderness'
  ];
  mapName:string = 'wilderness';
  loaded:boolean = true;
}