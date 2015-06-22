
import {Component, View, bootstrap, NgFor} from 'angular2/angular2';
import {RPGGame} from 'source/ui/services/rpggame';

import {WorldMap} from 'source/ui/worldmap/worldmap';

//pow2.EntityContainerResource.getClassType = (name:string) => {
//  // TODO: This needs to be async...
//  // replace the `.` with `/` and build a URL.
//  // System.import (or load or whatever) and when the promise resolves, resolve with the
//  // dynamically loaded type.
//  console.error('get type' + name);
//};

@Component({
  selector: 'rpg-app',
  appInjector: [RPGGame]
})
@View({
  template: `
    <style>@import url(./app.css);</style>
    <div>Select Map:
      <select #themap (change)="mapName=themap.value">
        <option *ng-for="#map of maps" [value]="map" [selected]="map==mapName">{{map}}</option>
      </select>
    </div>
    <rpg-map-canvas [map-name]="mapName"></rpg-map-canvas>
    <content></content>
  `,
  directives: [NgFor,WorldMap]
})
export class RPGAppComponent {
  maps:string[] = [
    'castle',
    'crypt',
    'fortress1',
    'fortress2',
    'isle',
    'keep',
    'lair',
    'port',
    'ruins',
    'sewer',
    'tower1',
    'tower2',
    'tower3',
    'town',
    'village',
    'wilderness'
  ];
  mapName:string = 'wilderness';

  constructor(game:RPGGame) {
    //game.loadGame(null,()=>console.info("Game initialized"));
  }

  selectMap(value:any){
    console.warn(value);
  }
}