import {IEntityTemplate} from './pow-core/resources/entities';
import {GameTileMap} from './gameTileMap';
import {PortalFeatureComponent} from './rpg/components/features/portalFeatureComponent';
import {CombatFeatureComponent} from './rpg/components/features/combatFeatureComponent';
import {DialogFeatureComponent} from './rpg/components/features/dialogFeatureComponent';
import {ShipFeatureComponent} from './rpg/components/features/shipFeatureComponent';
import {StoreFeatureComponent} from './rpg/components/features/storeFeatureComponent';
import {TempleFeatureComponent} from './rpg/components/features/templeFeatureComponent';
import {TreasureFeatureComponent} from './rpg/components/features/treasureFeatureComponent';
import {GameFeatureInputComponent} from './rpg/components/gameFeatureInputComponent';
import {GameEntityObject} from './rpg/objects/gameEntityObject';
import {TiledTMXResource} from './pow-core/resources/tiled/tiledTmx';
import {PlayerRenderComponent} from './pow2/game/components/playerRenderComponent';
import {CollisionComponent} from './pow2/scene/components/collisionComponent';
import {GameMapPathComponent} from './pow2/game/components/gameMapPathComponent';
import {PlayerComponent} from './rpg/components/playerComponent';
import {PlayerCameraComponent} from './rpg/components/playerCameraComponent';
import {PlayerTouchComponent} from './rpg/components/playerTouchComponent';
import {CombatCameraBehavior} from '../app/routes/combat/behaviors/combat-camera.behavior';
import {CombatEncounterBehavior} from '../app/routes/world/behaviors/combat-encounter.behavior';

/**
 * Array of composed game entity templates.
 *
 * TODO: This was written before Angular2, consider how to disambiguate from or combine with ng2 components.
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
        type: CombatEncounterBehavior
      },
      {
        name: 'input',
        type: GameFeatureInputComponent
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
      {name: 'render', type: PlayerRenderComponent},
      {name: 'collision', type: CollisionComponent},
      {name: 'paths', type: GameMapPathComponent, params: ['map']},
      {name: 'player', type: PlayerComponent},
      {name: 'camera', type: PlayerCameraComponent},
      {name: 'touch', type: PlayerTouchComponent}
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
