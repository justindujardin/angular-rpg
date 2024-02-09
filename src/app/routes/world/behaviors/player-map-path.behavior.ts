import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as _ from 'underscore';
import { AppState } from '../../../app.model';
import { TileMapPathBehavior } from '../../../behaviors/tile-map-path.behavior';
import { ITiledLayer, ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { getGameBoardedShip } from '../../../models/selectors';
import { assertTrue } from '../../../models/util';
import { TileMap } from '../../../scene/tile-map';
import { PlayerBehaviorComponent } from './player-behavior';

/**
 * Build Astar paths with GameFeatureObject tilemaps.
 */
@Component({
  selector: 'player-map-path-behavior',
  template: ` <ng-content></ng-content>`,
})
export class PlayerMapPathBehaviorComponent
  extends TileMapPathBehavior
  implements AfterViewInit, OnDestroy
{
  @Input() tileMap: TileMap;

  private _boardedSub: Subscription | null = null;

  constructor(public store: Store<AppState>) {
    super();
  }

  ngOnDestroy(): void {
    this._boardedSub?.unsubscribe();
    this._boardedSub = null;
  }
  ngAfterViewInit(): void {
    this._boardedSub = this.store
      .select(getGameBoardedShip)
      .pipe(debounceTime(50), distinctUntilChanged())
      .subscribe((boarded) => {
        assertTrue(this.host, 'invalid host object');
        const player = this.host.findBehavior<PlayerBehaviorComponent>(
          PlayerBehaviorComponent,
        );
        if (player) {
          player.passableKeys = boarded ? ['shipPassable'] : ['passable'];
          this._updateGraph();
        }
      });
  }

  buildWeightedGraph(): number[][] {
    let x: number;
    const layers: ITiledLayer[] = this.tileMap.getLayers();
    const l: number = layers.length;

    assertTrue(this.host, 'cannot build weighted graph without host object');
    const player = this.host.findBehavior<PlayerBehaviorComponent>(
      PlayerBehaviorComponent,
    );
    assertTrue(player, 'cannot build weighted graph without player object');

    const grid = new Array(this.tileMap.bounds.extent.x);
    for (x = 0; x < this.tileMap.bounds.extent.x; x++) {
      grid[x] = new Array(this.tileMap.bounds.extent.y);
    }

    for (x = 0; x < this.tileMap.bounds.extent.x; x++) {
      for (let y: number = 0; y < this.tileMap.bounds.extent.y; y++) {
        // Tile Weights, the higher the value the more avoided the
        // tile will be in output paths.

        // 10   - neutral path, can walk, don't particularly care for it.
        // 1    - desired path, can walk and tend toward it over netural.
        // 1000 - blocked path, can't walk, avoid at all costs.
        let weight: number = 10;
        let blocked: boolean = false;
        for (let i = 0; i < l; i++) {
          // If there is no metadata continue
          const terrain = this.tileMap.getTileData(layers[i], x, y);
          if (!terrain) {
            continue;
          }

          // Check to see if any layer has a passable attribute set to false,
          // if so block the path.
          for (let j = 0; j < player.passableKeys.length; j++) {
            if (
              terrain.properties &&
              terrain.properties[player.passableKeys[j]] === false
            ) {
              weight = 1000;
              blocked = true;
            }
          }
          if (terrain.properties?.isPath === true) {
            weight = 1;
          }
        }
        grid[x][y] = weight;
      }
    }

    const features = this.tileMap?.features?.objects || [];
    features.forEach((obj: ITiledObject | null) => {
      if (!obj?.class || !player) {
        return;
      }
      const collideTypes: string[] = PlayerBehaviorComponent.COLLIDE_TYPES;
      for (let j = 0; j < player.passableKeys.length; j++) {
        if (obj.properties && obj.properties[player.passableKeys[j]] === true) {
          return;
        }
      }
      if (!obj.class) {
        return;
      }
      if (_.indexOf(collideTypes, obj.class) !== -1) {
        /* tslint:disable */
        const xPos: number = (obj.x / obj.width) | 0;
        const yPos: number = (obj.y / obj.height) | 0;
        /* tslint:enable */
        if (this.tileMap.bounds.pointInRect(xPos, yPos)) {
          grid[xPos][yPos] = 100;
        }
      }
    });
    return grid;
  }
}
