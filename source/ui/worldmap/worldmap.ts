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
  properties: ['mapName'],
  host: {
    '(window:resize)': 'onResize($event)'
  }
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
      this.onResize();
      this._view.setTileMap(this.tileMap);
    });
  }

  private _renderCanvas:HTMLCanvasElement;
  private _canvasAcquired:boolean = false;
  private _stateKey:string = "_test2Pow2State";

  private _view:RPGMapView = null;
  private _canvas:HTMLCanvasElement = null;
  private _context:any = null;
  private _bounds:pow2.Point = new pow2.Point();

  constructor(public elRef:ElementRef, public game:RPGGame) {
    this._renderCanvas = <HTMLCanvasElement>document.createElement('canvas');
    this._renderCanvas.width = this._renderCanvas.height = 64;
    this._renderCanvas.style.position = 'absolute';
    this._renderCanvas.style.left = this._renderCanvas.style.top = '-9000px';

    this._canvas = elRef.domElement.querySelector('canvas');
    this._context = <CanvasRenderingContext2D>this._canvas.getContext("2d");
    this._context.webkitImageSmoothingEnabled = false;
    this._context.mozImageSmoothingEnabled = false;
    this._context.imageSmoothingEnabled = false;

    this._view = new RPGMapView(this._canvas, game.loader);
    this._view.camera.point.set(-0.5,-0.5);
    this.onResize();
    game.world.scene.addView(this._view);
  }

  onResize() {
    this.styleWidth = this._context.canvas.width = window.innerWidth;
    this.styleHeight = this._context.canvas.height = window.innerHeight;
    this._bounds.set(this.styleWidth,this.styleHeight);
    this._bounds = this._view.screenToWorld(this._bounds);


    // TileMap
    // Camera (window bounds)
    if(this.tileMap){
      var tileOffset = this.tileMap.bounds.getCenter();
      var offset = this._bounds.clone().divide(2).multiply(-1).add(tileOffset);
      this._view.camera.point.set(offset.floor());
    }


    this._view.camera.extent.set(this._bounds);
    this._context.webkitImageSmoothingEnabled = false;
    this._context.mozImageSmoothingEnabled = false;
    this._context.imageSmoothingEnabled = false;
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
