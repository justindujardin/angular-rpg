///<reference path="../../../typings/angular2/angular2.d.ts"/>
///<reference path="../../../bower_components/pow-core/lib/pow-core.d.ts"/>
///<reference path="../../../bower_components/pow2/lib/pow2.d.ts"/>
import {Component, View, bootstrap,ElementRef} from 'angular2/angular2';

import {GameWorld} from '../../gameWorld';
import {GameTileMap} from '../../gameTileMap';
import {RPGMapView} from '../../rpgMapView';
import {GameStateModel} from '../../models/gameStateModel';
import {HeroModel,HeroTypes} from '../../models/heroModel';
import {GameEntityObject} from '../../objects/gameEntityObject';
import {GameStateMachine} from '../../states/gameStateMachine';

import {RPGGame} from '../services/rpggame';

@Component({
  selector: 'rpg-map-canvas',
  properties: ['mapName']
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
export class WorldMap {
  styleHeight:number = 320;
  styleWidth:number = 640;
  styleBackground:string = 'rgba(0,0,0,1)';

  tileMap:GameTileMap = null;

  get mapName():string {
    return this.tileMap ? this.tileMap.name : '';
  }

  set mapName(value:string) {
    if (this.tileMap) {
      this.tileMap.destroy();
      this.tileMap = null;
    }
    this.game.loader.load(this.game.world.getMapUrl(value), (map:pow2.TiledTMXResource)=> {
      this.tileMap = new GameTileMap(map);
      this.game.world.scene.addObject(this.tileMap);
      this.tileMap.loaded();
      if(this.tileMap.bounds.extent.x > 50 || this.tileMap.bounds.extent.y > 50){
        this._view.camera.point.set(this.tileMap.bounds.getCenter());
      }
      else {
        this._view.camera.point.zero();
      }
      this._view.setTileMap(this.tileMap);
    });
  }

  private _renderCanvas:HTMLCanvasElement;
  private _canvasAcquired:boolean = false;
  private _stateKey:string = "_test2Pow2State";

  private _view:RPGMapView = null;

  constructor(public elRef:ElementRef, public game:RPGGame) {
    this._renderCanvas = <HTMLCanvasElement>document.createElement('canvas');
    this._renderCanvas.width = this._renderCanvas.height = 64;
    this._renderCanvas.style.position = 'absolute';
    this._renderCanvas.style.left = this._renderCanvas.style.top = '-9000px';

    this._view = new RPGMapView(elRef.domElement.querySelector('canvas'), game.loader);
    this._view.camera.point.set(5, 35);
    this._view.camera.extent.set(50, 50);
    game.world.scene.addView(this._view);
  }

  /**
   * Returns a canvas rendering context that may be drawn to.  A corresponding
   * call to releaseRenderContext will return the drawn content of the context.
   */
  getRenderContext(width:number, height:number):CanvasRenderingContext2D {
    if (this._canvasAcquired) {
      throw new Error("Only one rendering canvas is available at a time.  Check for calls to this function without corresponding releaseCanvas() calls.");
    }
    this._canvasAcquired = true;
    this._renderCanvas.width = width;
    this._renderCanvas.height = height;
    var context:any = this._renderCanvas.getContext('2d');
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    return context;
  }


  /**
   * Call this after getRenderContext to finish rendering and have the source
   * of the canvas content returned as a data url string.
   */
  releaseRenderContext():string {
    this._canvasAcquired = false;
    return this._renderCanvas.toDataURL();
  }

}
