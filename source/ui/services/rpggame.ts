///<reference path="../../../bower_components/pow-core/lib/pow-core.d.ts"/>
///<reference path="../../../bower_components/pow2/lib/pow2.d.ts"/>

import {GameWorld} from '../../gameWorld';
import {GameTileMap} from '../../gameTileMap';
import {HeroModel,HeroTypes} from '../../models/heroModel';
import {ItemModel} from '../../models/itemModel';
import {GameEntityObject} from '../../objects/gameEntityObject';
import {GameStateMachine} from '../../states/gameStateMachine';

export class RPGGame {
  styleHeight:number = 256;
  styleWidth:number = 256;
  styleBackground:string = 'rgba(0,0,0,1)';
  loader:pow2.ResourceLoader;
  world:GameWorld;
  sprite:GameEntityObject;
  machine:GameStateMachine;
  currentScene:pow2.scene.Scene;
  private _renderCanvas:HTMLCanvasElement;
  private _canvasAcquired:boolean = false;
  private _stateKey:string = "_angular2PowRPGState";

  constructor() {
    this._renderCanvas = <HTMLCanvasElement>document.createElement('canvas');
    this._renderCanvas.width = this._renderCanvas.height = 64;
    this._renderCanvas.style.position = 'absolute';
    this._renderCanvas.style.left = this._renderCanvas.style.top = '-9000px';

    this.loader = new pow2.ResourceLoader();
    this.currentScene = new pow2.scene.Scene({
      autoStart: true,
      debugRender: false
    });
    this.world = pow2.getWorld<GameWorld>('rpg');
    this.world.setService('scene', this.currentScene);
    this.machine = this.world.state;
    // Tell the world time manager to start ticking.
    this.world.time.start();
  }

  getSaveData():any {
    return localStorage.getItem(this._stateKey);
  }

  resetGame() {
    localStorage.removeItem(this._stateKey);
  }

  saveGame(data:any) {
    localStorage.setItem(this._stateKey, data);
  }


  createPlayer(from:HeroModel, tileMap:GameTileMap, at?:pow2.Point) {
    if (!from) {
      throw new Error("Cannot create player without valid model");
    }
    if (!this.world.entities.isReady()) {
      throw new Error("Cannot create player before entities container is loaded");
    }
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    this.sprite = this.world.entities.createObject('GameMapPlayer', {
      model: from,
      map: tileMap
    });
    this.sprite.name = from.attributes.name;
    this.sprite.icon = from.attributes.icon;
    this.world.scene.addObject(this.sprite);
    if (typeof at === 'undefined' && tileMap instanceof pow2.tile.TileMap) {
      at = tileMap.bounds.getCenter();
    }
    this.sprite.setPoint(at || new pow2.Point());
  }

  //loadMap(mapName:string, then?:()=>any, player?:HeroModel, at?:pow2.Point) {
  //  if (this.tileMap) {
  //    this.tileMap.destroy();
  //    this.tileMap = null;
  //  }
  //
  //  this.world.loader.load(this.world.getMapUrl(mapName), (map:pow2.TiledTMXResource)=> {
  //    this.tileMap = this.world.entities.createObject('GameMapObject', {
  //      resource: map
  //    });
  //
  //    var model:HeroModel = player || this.world.model.party[0];
  //    this.createPlayer(model, at);
  //
  //    this.world.scene.addObject(this.tileMap);
  //    this.tileMap.loaded();
  //
  //
  //    then && then();
  //  });
  //}

  //newGame(then?:()=>any) {
  //  this.loadMap("town", then, this.world.model.party[0]);
  //}

  //loadGame(data:any, then?:()=>any) {
  //  if (data) {
  //    //this.world.model.clear();
  //    this.world.model.initData(()=> {
  //      this.world.model.parse(data);
  //      var at = this.world.model.getKeyData('playerPosition');
  //      at = at ? new pow2.Point(at.x, at.y) : undefined;
  //      this.loadMap(this.world.model.getKeyData('playerMap') || "town", then, this.world.model.party[0], at);
  //    });
  //  }
  //  else {
  //    if (this.world.model.party.length === 0) {
  //      this.world.model.addHero(HeroModel.create(HeroTypes.Warrior, "Warrior"));
  //      this.world.model.addHero(HeroModel.create(HeroTypes.Ranger, "Ranger"));
  //      this.world.model.addHero(HeroModel.create(HeroTypes.LifeMage, "Mage"));
  //    }
  //    this.newGame(then);
  //  }
  //}

  party:HeroModel[] = [];
  inventory:ItemModel[] = [];
  player:HeroModel = null;


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
