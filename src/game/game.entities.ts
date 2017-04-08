import {IEntityTemplate} from './pow-core/resources/entities';
import {GameTileMap} from './gameTileMap';
import {PortalFeatureComponent} from '../app/routes/world/map/features/portal-feature.component';
import {CombatFeatureComponent} from '../app/routes/world/map/features/combat-feature.component';
import {DialogFeatureComponent} from '../app/routes/world/map/features/dialog-feature.component';
import {ShipFeatureComponent} from '../app/routes/world/map/features/ship-feature.component';
import {StoreFeatureComponent} from '../app/routes/world/map/features/store-feature.component';
import {TempleFeatureComponent} from '../app/routes/world/map/features/temple-feature.component';
import {TreasureFeatureComponent} from '../app/routes/world/map/features/treasure-feature.component';
import {MapFeatureInputBehaviorComponent} from '../app/routes/world/behaviors/map-feature-input.behavior';
import {GameEntityObject} from './rpg/objects/gameEntityObject';
import {TiledTMXResource} from './pow-core/resources/tiled/tiledTmx';
import {PlayerRenderBehaviorComponent} from '../app/routes/world/behaviors/player-render.behavior';
import {CollisionBehaviorComponent} from '../app/behaviors/collision.behavior';
import {PlayerMapPathBehaviorComponent} from '../app/routes/world/behaviors/player-map-path.behavior';
import {PlayerBehaviorComponent} from '../app/routes/world/behaviors/player-behavior';
import {PlayerCameraBehaviorComponent} from '../app/routes/world/behaviors/playerCameraComponent';
import {PlayerTouchBehaviorComponent} from '../app/routes/world/behaviors/player-touch.behavior';
import {CombatCameraBehavior} from '../app/routes/combat/behaviors/combat-camera.behavior';
import {CombatEncounterBehaviorComponent} from '../app/routes/world/behaviors/combat-encounter.behavior';

/**
 * Array of composed game entity templates.
 *
 * TODO: This was written before Angular2, consider how to disambiguate from or combine with ng2 map.
 */
export const RPG_GAME_ENTITIES: IEntityTemplate[] = [
  {
    name: 'GameMapObject',
    type: GameTileMap,
    depends: [
      PortalFeatureComponent,
      CombatFeatureComponent,
      DialogFeatureComponent,
      ShipFeatureComponent,
      StoreFeatureComponent,
      TempleFeatureComponent,
      TreasureFeatureComponent
    ],
    inputs: {
      resource: TiledTMXResource
    },
    params: ['resource'],
    components: [
      {
        name: 'encounters',
        type: CombatEncounterBehaviorComponent
      },
      {
        name: 'input',
        type: MapFeatureInputBehaviorComponent
      }
    ]
  },
  {
    name: 'GameMapPlayer',
    type: GameEntityObject,
    inputs: {
      model: Object,
      map: GameTileMap
    },
    components: [
      {name: 'render', type: PlayerRenderBehaviorComponent},
      {name: 'collision', type: CollisionBehaviorComponent},
      {name: 'paths', type: PlayerMapPathBehaviorComponent, params: ['map']},
      {name: 'player', type: PlayerBehaviorComponent},
      {name: 'camera', type: PlayerCameraBehaviorComponent},
      {name: 'touch', type: PlayerTouchBehaviorComponent}
    ]
  },
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
