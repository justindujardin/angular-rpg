import {IEntityTemplate} from './pow-core/resources/entities';
import {GameTileMap} from './gameTileMap';
import {TiledTMXResource} from './pow-core/resources/tiled/tiledTmx';
import {CombatCameraBehavior} from '../app/routes/combat/behaviors/combat-camera.behavior';

/**
 * Array of composed game entity templates.
 *
 * TODO: This was written before Angular2, consider how to disambiguate from or combine with ng2 map.
 */
export const RPG_GAME_ENTITIES: IEntityTemplate[] = [
  {
    name: 'GameCombatMap',
    type: GameTileMap,
    inputs: {
      resource: TiledTMXResource
    },
    params: ['resource'],
    components: [
      {
        type: CombatCameraBehavior
      }
    ]
  }
];
