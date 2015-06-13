///<reference path="typings/angular2/angular2.d.ts"/>

import {Component, View, bootstrap, NgFor} from 'angular2/angular2';

@Component({
  selector: 'rpg-map-canvas'
})
@View({
  template: `
  <canvas [width]="styleWidth" [height]="styleHeight">
    Your browser doesn't support this.
  </canvas>
  `,
  host: {
    '[style.height]': 'styleHeight',
    '[style.width]': 'styleWidth',
    '[style.color]': 'styleBackground'
  }
})
class RPGMapCanvas {
  styleHeight:number = 256;
  styleWidth:number = 256;
  styleBackground:string = 'rgba(0,0,0,1)';
}
bootstrap(RPGMapCanvas);

@Component({
  selector: 'rpg-app'
})
@View({
  template: `
    <style>@import url(./app.css);</style>
    <h1>{{name}}</h1>
    <content></content>
    <!--<ul>-->
      <!--<li *ng-for="#cool of things">-->
        <!--{{cool}}-->
      <!--</li>-->
    <!--</ul>-->
  `,
  directives: [NgFor]
})
class RPGAppComponent {
  name:string = 'pow2 - rpg!';
  things:string[] = ['one', 'two', 'three'];
}

bootstrap(RPGAppComponent);