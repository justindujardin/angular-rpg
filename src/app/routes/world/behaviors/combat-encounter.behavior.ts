import {GameWorld} from '../../../../app/services/gameWorld';
import {SceneComponent} from '../../../../game/pow2/scene/sceneComponent';
import {GameTileMap} from '../../../../game/gameTileMap';
import {GameEntityObject} from '../../../../game/rpg/objects/gameEntityObject';
import {PlayerBehaviorComponent} from './player-behavior';
import {Point} from '../../../../game/pow-core/point';
import {IZoneMatch} from '../../../../game/rpg/game';
import {GameStateSetKeyDataAction} from '../../../models/game-state/game-state.actions';
import {getGameBattleCounter} from '../../../models/selectors';
import {Component} from '@angular/core';

/**
 * A component that when added to a GameTileMap listens
 * to the player moves and after a random number of them forces
 * an encounter with a group of creatures from the current combat
 * zone.
 */
@Component({
  selector: 'combat-encounter-behavior',
  template: `<ng-content></ng-content>`
})
export class CombatEncounterBehaviorComponent extends SceneComponent {
  host: GameTileMap;
  battleCounter: number;
  combatFlag: boolean = false;
  combatZone: string = 'default';
  isDangerous: boolean = false;
  enabled: boolean = false;

  connectBehavior(): boolean {
    const world = GameWorld.get();
    if (!world || !super.connectBehavior() || !(this.host instanceof GameTileMap)) {
      return false;
    }
    // Get the initial battle counter value
    world.store.select(getGameBattleCounter).take(1).subscribe((p: number) => {
      if (p === undefined) {
        this.resetBattleCounter();
      }
    });
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

  syncBehavior(): boolean {
    super.syncBehavior();
    // Determine if the map wants this component to be enabled.
    this.enabled = this.host.map && this.host.map.properties && this.host.map.properties.combat;
    this.stopListening();
    this.player = null;
    if (this.host.scene) {
      this.player = this.host.scene.objectByComponent(PlayerBehaviorComponent) as GameEntityObject;
    }
    this.listenMoves();
    return !!this.player;
  }

  listenMoves() {
    this.stopListening();
    if (this.player && this.enabled) {
      this.player.on(PlayerBehaviorComponent.Events.MOVE_BEGIN, this.moveProcess, this);
    }
  }

  stopListening() {
    if (this.player) {
      this.player.off(null, null, this);
    }
  }

  moveProcess(player: PlayerBehaviorComponent, from: Point, to: Point) {
    const terrain = this.host.getTerrain('Terrain', to.x, to.y);
    this.isDangerous = terrain && terrain.isDangerous;
    const dangerValue = this.isDangerous ? 10 : 6;
    if (this.battleCounter <= 0) {
      this.triggerCombat(to);
    }
    this._setCounter(this.battleCounter - dangerValue);
    return false;
  }

  resetBattleCounter() {
    const max: number = 255;
    const min: number = 64;
    this._setCounter(Math.floor(Math.random() * (max - min + 1)) + min);
    this.combatFlag = false;
  }

  triggerCombat(at: Point) {
    const zone: IZoneMatch = this.host.getCombatZones(at);
    zone.fixed = false;
    this.combatZone = zone.map || zone.target;
    console.log(`Combat in zone : ${this.combatZone}`);
    this.stopListening();

    console.warn('HACK in triggerCombat - static get GameWorld... need injection strategy');
    const world = GameWorld.get();
    world.randomEncounter(zone, () => {
      this.resetBattleCounter();
      this.listenMoves();
    });
    this.combatFlag = true;
  }

  private _setCounter(value: number) {
    this.battleCounter = value;
    const world = GameWorld.get();
    if (world) {
      world.store.dispatch(new GameStateSetKeyDataAction('battleCounter', this.battleCounter));
    }
  }
}
