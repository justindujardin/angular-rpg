/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

///<reference path="../../../bower_components/pow2/lib/pow2.d.ts"/>
import {Inject} from 'angular2/angular2';

import {GameWorld} from '../../gameWorld';
import {GameTileMap} from '../../gameTileMap';
import {HeroModel,HeroTypes} from '../../models/heroModel';
import {ItemModel} from '../../models/itemModel';
import {GameEntityObject} from '../../objects/gameEntityObject';
import {GameStateMachine} from '../../states/gameStateMachine';

export class RPGGame {
  styleBackground:string = 'rgba(0,0,0,1)';
  loader:pow2.ResourceLoader;
  world:GameWorld;
  sprite:GameEntityObject;
  machine:GameStateMachine;
  private _renderCanvas:HTMLCanvasElement;
  private _canvasAcquired:boolean = false;
  private _stateKey:string = "_angular2PowRPGState";


  // Party Position Data
  partyPosition:pow2.Point = new pow2.Point(0, 0);
  partyMapName:string = 'town';

  constructor() {
    this._renderCanvas = <HTMLCanvasElement>document.createElement('canvas');
    this._renderCanvas.width = this._renderCanvas.height = 64;
    this._renderCanvas.style.position = 'absolute';
    this._renderCanvas.style.left = this._renderCanvas.style.top = '-9000px';

    this.loader = new pow2.ResourceLoader();
    this.world = pow2.getWorld<GameWorld>('rpg');
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

  saveGame() {
    var party = <pow2.scene.components.PlayerComponent>this.world.scene.componentByType(pow2.scene.components.PlayerComponent);
    if (party) {
      this.world.model.setKeyData('playerPosition', party.host.point);
    }
    this.world.model.setKeyData('playerMap', this.partyMapName);
    var data = JSON.stringify(this.world.model.toJSON());
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
    if (!this.sprite) {
      throw new Error("Failed to create map player");
    }
    this.sprite.name = from.attributes.name;
    this.sprite.icon = from.attributes.icon;
    this.world.scene.addObject(this.sprite);

    // If no point is specified, use the position of the first Portal on the current map
    if (typeof at === 'undefined' && tileMap instanceof pow2.tile.TileMap && this.partyPosition.isZero()) {
      var portal:any = _.where(tileMap.features.objects, {type: 'source.components.features.PortalFeatureComponent'})[0];
      if (portal) {
        at = new pow2.Point(portal.x / portal.width, portal.y / portal.height);
      }
    }
    this.sprite.setPoint(at || this.partyPosition);
  }

  /**
   * Initialize the game and resolve a promise that indicates whether the game
   * is new or was loaded from save data.  Resolves with true if the game is new.
   */
  initGame(data:any = this.getSaveData()):Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (data) {
        return this.world.model.initData(()=> {
          this.world.model.parse(data);
          var at = this.world.model.getKeyData('playerPosition');
          this.partyPosition = at ? new pow2.Point(at.x, at.y) : undefined;
          this.partyMapName = this.world.model.getKeyData('playerMap') || "town";
          resolve(false);
        });
      }
      else {
        this.world.model.addHero(HeroModel.create(HeroTypes.Warrior, "Warrior"));
        this.world.model.addHero(HeroModel.create(HeroTypes.Ranger, "Ranger"));
        this.world.model.addHero(HeroModel.create(HeroTypes.LifeMage, "Mage"));
        this.partyPosition = new pow2.Point(10, 5);
        this.partyMapName = "town";
        resolve(true);
      }
    });
  }

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
