
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BasePlayerComponent } from '../../../behaviors/base-player.behavior';
import { IMoveDescription } from '../../../behaviors/movable-behavior';
import { ITiledLayer } from '../../../core/resources/tiled/tiled.model';
import { GameStateMoveAction } from '../../../models/game-state/game-state.actions';
import { GameEntityObject } from '../../../scene/objects/game-entity-object';
import { GameFeatureObject } from '../../../scene/objects/game-feature-object';
import { TileMap } from '../../../scene/tile-map';

@Component({
  selector: 'player-behavior',
  template: `<ng-content></ng-content>`,
})
export class PlayerBehaviorComponent extends BasePlayerComponent {
  host: GameEntityObject;
  @Input()
  map: TileMap | null = null;

  static COLLIDE_TYPES: string[] = [
    'BlockFeatureComponent',
    'TempleFeatureComponent',
    'ArmorsStoreFeatureComponent',
    'ItemsStoreFeatureComponent',
    'MagicsStoreFeatureComponent',
    'WeaponsStoreFeatureComponent',
    'DialogFeatureComponent',
    'DoorFeatureComponent',
    'CombatFeatureComponent',
  ];

  /**
   * Output when a move on the map is completed.
   */
  @Output() onCompleteMove = new EventEmitter<IMoveDescription>();

  /**
   * Collide with the rpg tile map features and obstacles.
   */
  collideMove(x: number, y: number, results: GameFeatureObject[] = []): boolean {
    if (this.host.scene && !this.map) {
      this.map = this.host.scene.objectByType(TileMap) as TileMap;
    }
    let i = 0;

    const collision: boolean = !!this.collider?.collide<GameFeatureObject>(
      x,
      y,
      GameFeatureObject,
      results
    );
    if (collision) {
      for (i = 0; i < results.length; i++) {
        const o: GameFeatureObject = results[i];
        const isPassable = o.feature?.properties?.passable === true;
        const isDisabled = !o.enabled;
        if (isPassable || !o.feature?.class || isDisabled) {
          return false;
        }
        if (PlayerBehaviorComponent.COLLIDE_TYPES.includes(o.feature.class)) {
          return true;
        }
      }
    }
    // Iterate over all layers of the map, check point(x,y) and see if the tile
    // has any unpassable attributes set on it.  If any unpassable attributes are
    // found, there is a collision.
    if (this.map) {
      const layers: ITiledLayer[] = this.map.getLayers();
      for (i = 0; i < layers.length; i++) {
        const terrain = this.map.getTileData(layers[i], x, y);
        if (!terrain) {
          continue;
        }
        for (let j = 0; j < this.passableKeys.length; j++) {
          if (
            terrain.properties &&
            terrain.properties[this.passableKeys[j]] === false
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Called when a complete tick of movement occurs.
   * @param move The move that is now completed.
   */
  completeMove(move: IMoveDescription) {
    // HACKS: Need an injection strategy for these behavior components.
    this.host.world.store.dispatch(new GameStateMoveAction(move.to));
    this.onCompleteMove.next(move);
    super.completeMove(move);
  }
}
