import {IEntityTemplate} from '../../game/pow-core/resources/entities.resource';
import {GameTileMap} from './game-tile-map';
import {TiledTMXResource} from '../../game/pow-core/resources/tiled/tiled-tmx.resource';
import {CombatCameraBehavior} from '../routes/combat/behaviors/combat-camera.behavior';

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
