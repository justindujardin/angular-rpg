///<reference path="../../../bower_components/pow-core/lib/pow-core.d.ts"/>
///<reference path="../../../bower_components/pow2/lib/pow2.d.ts"/>

import {Injectable} from 'angular2/angular2';

import {GameWorld} from '../../gameWorld';
import {GameTileMap} from '../../gameTileMap';
import {GameStateModel} from '../../models/gameStateModel';
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
  tileMap:GameTileMap;
  sprite:GameEntityObject;
  machine:GameStateMachine;
  currentScene:pow2.scene.Scene;
  entities:pow2.EntityContainerResource;
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
    this.world = new GameWorld({
      scene: this.currentScene,
      model: new GameStateModel(),
      state: new GameStateMachine()
    });
    this.machine = this.world.state;
    pow2.registerWorld('pow2', this.world);
    // Tell the world time manager to start ticking.
    this.world.time.start();
    this.entities = <pow2.EntityContainerResource>this.world.loader.load(pow2.GAME_ROOT + 'entities/map.powEntities');
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


  createPlayer(from:HeroModel, at?:pow2.Point) {
    if (!from) {
      throw new Error("Cannot create player without valid model");
    }
    if (!this.entities.isReady()) {
      throw new Error("Cannot create player before entities container is loaded");
    }
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    this.sprite = this.entities.createObject('GameMapPlayer', {
      model: from,
      map: this.tileMap
    });
    this.sprite.name = from.attributes.name;
    this.sprite.icon = from.attributes.icon;
    this.world.scene.addObject(this.sprite);
    if (typeof at === 'undefined' && this.tileMap instanceof pow2.tile.TileMap) {
      at = this.tileMap.bounds.getCenter();
    }
    this.sprite.setPoint(at || new pow2.Point());
  }

  loadMap(mapName:string, then?:()=>any, player?:HeroModel, at?:pow2.Point) {
    if (this.tileMap) {
      this.tileMap.destroy();
      this.tileMap = null;
    }

    this.world.loader.load(this.world.getMapUrl(mapName), (map:pow2.TiledTMXResource)=> {
      this.tileMap = new GameTileMap(map);
      this.world.scene.addObject(this.tileMap);
      this.tileMap.loaded();


      //    this.entities.createObject('GameMapObject', {
      //  resource: map
      //});
      var model:HeroModel = player || this.world.model.party[0];
      //this.createPlayer(model, at);
      then && then();
    });
  }

  newGame(then?:()=>any) {
    this.loadMap("town", then, this.world.model.party[0]);
  }

  loadGame(data:any, then?:()=>any) {
    if (data) {
      //this.world.model.clear();
      this.world.model.initData(()=> {
        this.world.model.parse(data);
        var at = this.world.model.getKeyData('playerPosition');
        at = at ? new pow2.Point(at.x, at.y) : undefined;
        this.loadMap(this.world.model.getKeyData('playerMap') || "town", then, this.world.model.party[0], at);
      });
    }
    else {
      if (this.world.model.party.length === 0) {
        this.world.model.addHero(HeroModel.create(HeroTypes.Warrior, "Warrior"));
        this.world.model.addHero(HeroModel.create(HeroTypes.Ranger, "Ranger"));
        this.world.model.addHero(HeroModel.create(HeroTypes.LifeMage, "Mage"));
      }
      this.newGame(then);
    }
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

//class RPGAppComponent {
//  name:string = 'pow2 - rpg!';
//  things:string[] = ['one', 'two', 'three'];
//
//  loadingTitle:string = 'Angular2 RPG';
//  loadingMessage:string = 'Asking Google for data...';
//  loading:boolean = true;
//
//  gameModel:GameStateModel = null;
//
//  constructor() {
//    GameStateModel.getDataSource(()=> {
//      this.loadingMessage = "Loading the things...";
//      this.loadGame(this.getSaveData(), ()=> {
//        $scope.gameModel = game.world.model;
//        $scope.party = game.world.model.party;
//        $scope.inventory = game.world.model.inventory;
//        $scope.player = game.world.model.party[0];
//        $scope.loading = false;
//        $scope.loaded = true;
//      });
//    });
//
//    // Dialog bubbles
//    game.world.scene.on('treasure:entered', (feature) => {
//      if (typeof feature.gold !== 'undefined') {
//        game.world.model.addGold(feature.gold);
//        powAlert.show("You found " + feature.gold + " gold!", null, 0);
//      }
//      if (typeof feature.item === 'string') {
//        // Get items data from spreadsheet
//        rpg.models.GameStateModel.getDataSource((data:pow2.GameDataResource) => {
//          var item:rpg.models.ItemModel = null;
//          var desc:any = _.where(data.getSheetData('weapons'), {id: feature.item})[0];
//          if (desc) {
//            item = new rpg.models.WeaponModel(desc);
//          }
//          else {
//            desc = _.where(data.getSheetData('armor'), {id: feature.item})[0];
//            if (desc) {
//              item = new rpg.models.ArmorModel(desc);
//            }
//          }
//          if (!item) {
//            return;
//          }
//          game.world.model.inventory.push(item);
//          powAlert.show("You found " + item.get('name') + "!", null, 0);
//
//        });
//
//      }
//    });
//
//
//    game.currentScene.on(pow2.tile.TileMap.Events.MAP_LOADED, (map:rpg.GameTileMap) => {
//      game.world.model.setKeyData('playerMap', map.map.url);
//    });
//    // TODO: A better system for game event handling.
//    game.machine.on('enter', (state) => {
//      if (state.name === rpg.states.GameCombatState.NAME) {
//        $scope.$apply(()=> {
//          $scope.combat = state.machine;
//          $scope.inCombat = true;
//          state.machine.on('combat:attack', (data:rpg.states.combat.CombatAttackSummary)=> {
//            var _done = state.machine.notifyWait();
//            var msg:string = '';
//            var a = data.attacker.model.get('name');
//            var b = data.defender.model.get('name');
//            if (data.damage > 0) {
//              msg = a + " attacked " + b + " for " + data.damage + " damage!";
//            }
//            else {
//              msg = a + " attacked " + b + ", and MISSED!";
//            }
//            powAlert.show(msg, _done);
//          });
//          state.machine.on('combat:run', (data:rpg.components.combat.actions.CombatRunSummary)=> {
//            var _done = state.machine.notifyWait();
//            var msg:string = data.player.model.get('name');
//            if (data.success) {
//              msg += ' bravely ran away!';
//            }
//            else {
//              msg += ' failed to escape!';
//            }
//            powAlert.show(msg, _done);
//          });
//          state.machine.on('combat:victory', (data:rpg.states.combat.CombatVictorySummary) => {
//            var _done = state.machine.notifyWait();
//            powAlert.show("Found " + data.gold + " gold!", null, 0);
//            powAlert.show("Gained " + data.exp + " experience!", null, 0);
//            angular.forEach(data.levels, (hero:rpg.models.HeroModel) => {
//              powAlert.show(hero.get('name') + " reached level " + hero.get('level') + "!", null, 0);
//            });
//            powAlert.show("Enemies Defeated!", _done);
//          });
//          state.machine.on('combat:defeat', (data:rpg.states.combat.CombatDefeatSummary) => {
//            powAlert.show("Your party was defeated...", () => {
//              game.loadGame(game.getSaveData(), ()=> {
//                $scope.$apply(()=> {
//                  $scope.gameModel = game.world.model;
//                  $scope.party = game.world.model.party;
//                  $scope.inventory = game.world.model.inventory;
//                  $scope.player = game.world.model.party[0];
//                  $scope.combat = null;
//                  $scope.inCombat = false;
//                });
//              });
//            }, 0);
//          });
//        });
//      }
//    });
//    game.machine.on('exit', (state) => {
//      $scope.$apply(() => {
//        if (state.name === rpg.states.GameMapState.NAME) {
//          $scope.dialog = null;
//          $scope.store = null;
//        }
//        else if (state.name === rpg.states.GameCombatState.NAME) {
//          $scope.inCombat = false;
//          $scope.combat = null;
//        }
//      });
//      console.log("UI: Exited state: " + state.name);
//    });
//  }
//}
