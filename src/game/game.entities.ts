import {IEntityTemplate} from './pow-core/resources/entities';
import {GameTileMap} from './gameTileMap';
import {PortalFeatureComponent} from './rpg/components/features/portalFeatureComponent';
import {CombatFeatureComponent} from './rpg/components/features/combatFeatureComponent';
import {DialogFeatureComponent} from './rpg/components/features/dialogFeatureComponent';
import {ShipFeatureComponent} from './rpg/components/features/shipFeatureComponent';
import {StoreFeatureComponent} from './rpg/components/features/storeFeatureComponent';
import {TempleFeatureComponent} from './rpg/components/features/templeFeatureComponent';
import {TreasureFeatureComponent} from './rpg/components/features/treasureFeatureComponent';
import {CombatEncounterComponent} from './rpg/components/combat/combatEncounterComponent';
import {GameFeatureInputComponent} from './rpg/components/gameFeatureInputComponent';
import {PlayerCombatRenderComponent} from './pow2/game/components/playerCombatRenderComponent';
import {PlayerCombatState} from './rpg/states/playerCombatState';
import {HeroModel} from './rpg/models/heroModel';
import {GameEntityObject} from './rpg/objects/gameEntityObject';
import {CombatMagicComponent} from './rpg/components/combat/actions/combatMagicComponent';
import {CombatAttackComponent} from './rpg/components/combat/actions/combatAttackComponent';
import {AnimatedComponent} from './pow2/game/components/animatedComponent';
import {CombatItemComponent} from './rpg/components/combat/actions/combatItemComponent';
import {CombatRunComponent} from './rpg/components/combat/actions/combatRunComponent';
import {CombatGuardComponent} from './rpg/components/combat/actions/combatGuardComponent';
import {EntityModel} from './rpg/models/entityModel';
import {SpriteComponent} from './pow2/tile/components/spriteComponent';
import {TiledTMXResource} from './pow-core/resources/tiled/tiledTmx';
import {PlayerRenderComponent} from './pow2/game/components/playerRenderComponent';
import {CollisionComponent} from './pow2/scene/components/collisionComponent';
import {GameMapPathComponent} from './pow2/game/components/gameMapPathComponent';
import {PlayerComponent} from './rpg/components/playerComponent';
import {PlayerCameraComponent} from './rpg/components/playerCameraComponent';
import {PlayerTouchComponent} from './rpg/components/playerTouchComponent';
import {CombatCameraComponent} from './rpg/components/combat/combatCameraComponent';


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
    params: ["resource"],
    components: [
      {
        name: "encounters",
        type: CombatEncounterComponent
      },
      {
        name: "input",
        type: GameFeatureInputComponent
      }
    ]
  },
  {
    name: "GameMapPlayer",
    type: GameEntityObject,
    inputs: {
      "model": HeroModel,
      "map": GameTileMap
    },
    components: [
      {
        name: "render",
        type: PlayerRenderComponent
      },
      {
        name: "collision",
        type: CollisionComponent
      },
      {
        name: "paths",
        type: GameMapPathComponent,
        params: ["map"]
      },
      {
        name: "player",
        type: PlayerComponent
      },
      {
        name: "camera",
        type: PlayerCameraComponent
      },
      {
        name: "touch",
        type: PlayerTouchComponent
      }
    ]
  },
  {
    name: "GameCombatMap",
    type: GameTileMap,
    inputs: {
      resource: TiledTMXResource
    },
    params: ["resource"],
    components: [
      {
        type: CombatCameraComponent
      }
    ]
  },
  {
    name: "CombatPlayer",
    type: GameEntityObject,
    inputs: {
      model: HeroModel,
      combat: PlayerCombatState
    },
    components: [
      {
        name: "render",
        type: PlayerCombatRenderComponent
      },
      {
        name: "animation",
        type: AnimatedComponent
      },
      {
        name: "attack",
        type: CombatAttackComponent,
        params: ["combat"]
      },
      {
        name: "magic",
        type: CombatMagicComponent,
        params: ["combat"]
      },
      {
        name: "item",
        type: CombatItemComponent,
        params: ["combat"]
      },
      {
        name: "run",
        type: CombatRunComponent,
        params: ["combat"]
      },
      {
        name: "guard",
        type: CombatGuardComponent,
        params: ["combat"]
      }
    ]
  },
  {
    name: "CombatEnemy",
    type: GameEntityObject,
    inputs: {
      "model": EntityModel,
      "combat": PlayerCombatState,
      "sprite": Object
    },
    components: [
      {
        name: "sprite",
        type: SpriteComponent,
        params: ["sprite"]
      },
      {
        name: "attack",
        type: CombatAttackComponent,
        params: ["combat"]
      }
    ]
  }
];
