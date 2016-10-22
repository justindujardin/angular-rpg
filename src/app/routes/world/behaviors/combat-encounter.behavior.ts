import {GameWorld} from '../../../../app/services/gameWorld';
import {SceneComponent} from '../../../../game/pow2/scene/sceneComponent';
import {GameTileMap} from '../../../../game/gameTileMap';
import {GameEntityObject} from '../../../../game/rpg/objects/gameEntityObject';
import {PlayerComponent} from '../../../../game/rpg/components/playerComponent';
import {Point} from '../../../../game/pow-core/point';
import {IZoneMatch} from '../../../../game/rpg/game';

/**
 * A component that when added to a GameTileMap listens
 * to the player moves and after a random number of them forces
 * an encounter with a group of creatures from the current combat
 * zone.
 */
export class CombatEncounterBehavior extends SceneComponent {
  host: GameTileMap;
  battleCounter: number;
  combatFlag: boolean = false;
  combatZone: string = 'default';
  isDangerous: boolean = false;
  enabled: boolean = false;

  connectBehavior(): boolean {
    const world = GameWorld.get();
    if (!world || !world.model || !super.connectBehavior() || !(this.host instanceof GameTileMap)) {
      return false;
    }

    this.battleCounter = world.model.getKeyData('battleCounter');
    if (typeof this.battleCounter === 'undefined') {
      this.resetBattleCounter();
    }
    return true;
  }

  disconnectBehavior(): boolean {
    if (this.player) {
      this.player.off(null, null, this);
    }
    this.player = null;
    return super.disconnectBehavior();
  }

  player: GameEntityObject = null;

  syncComponent(): boolean {
    super.syncComponent();
    // Determine if the map wants this component to be enabled.
    this.enabled = this.host.map && this.host.map.properties && this.host.map.properties.combat;
    this.stopListening();
    this.player = null;
    if (this.host.scene) {
      this.player = <GameEntityObject>this.host.scene.objectByComponent(PlayerComponent);
    }
    this.listenMoves();
    return !!this.player;
  }

  listenMoves() {
    this.stopListening();
    if (this.player && this.enabled) {
      this.player.on(PlayerComponent.Events.MOVE_BEGIN, this.moveProcess, this);
    }
  }

  stopListening() {
    if (this.player) {
      this.player.off(null, null, this);
    }
  }

  moveProcess(player: PlayerComponent, from: Point, to: Point) {
    var terrain = this.host.getTerrain("Terrain", to.x, to.y);
    this.isDangerous = terrain && terrain.isDangerous;
    var dangerValue = this.isDangerous ? 10 : 6;
    if (this.battleCounter <= 0) {
      this.triggerCombat(to);
    }
    this._setCounter(this.battleCounter - dangerValue);
    return false;
  }

  resetBattleCounter() {
    var max: number = 255;
    var min: number = 64;
    this._setCounter(Math.floor(Math.random() * (max - min + 1)) + min);
    this.combatFlag = false;
  }

  triggerCombat(at: Point) {
    var zone: IZoneMatch = this.host.getCombatZones(at);
    zone.fixed = false;
    this.combatZone = zone.map || zone.target;
    console.log("Combat in zone : " + this.combatZone);
    this.stopListening();

    console.warn('HACK in triggerCombat - static get GameWorld... need injection strategy');
    const world = GameWorld.get();
    world.randomEncounter(zone, ()=> {
      this.resetBattleCounter();
      this.listenMoves();
    });
    this.combatFlag = true;
  }

  private _setCounter(value: number) {
    this.battleCounter = value;
    const world = GameWorld.get();
    if (world) {
      world.model.setKeyData('battleCounter', this.battleCounter);
    }
  }
}
