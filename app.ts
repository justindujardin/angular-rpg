
import {Component, View, bootstrap, NgFor} from 'angular2/angular2';
import {RpgGame} from 'source/ui/services/rpggame';


pow2.EntityContainerResource.getClassType = (name:string) => {
  // TODO: This needs to be async...
  // replace the `.` with `/` and build a URL.
  // System.import (or load or whatever) and when the promise resolves, resolve with the
  // dynamically loaded type.
  console.error('get type' + name);
};

@Component({
  selector: 'rpg-app',
  appInjector: [RpgGame]
})
@View({
  template: `
    <style>@import url(./app.css);</style>
    <!--<ul>-->
      <!--<li *ng-for="#cool of things">-->
        <!--{{cool}}-->
      <!--</li>-->
    <!--</ul>-->
  `,
  directives: [NgFor]
})
class RPGAppComponent {
  things:string[] = ['one', 'two', 'three'];

  constructor(game:RpgGame) {
    game.loadGame(null,()=>console.info("Game initialized"));
  }
}

bootstrap(RPGAppComponent);