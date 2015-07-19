/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import * as rpg from '../../game';

import {GameEntityObject} from '../../objects/gameEntityObject';
import {GameTileMap} from '../../gameTileMap';
import {GameWorld} from '../../gameWorld';

/**
 * A component that when added to a GameTileMap listens
 * to the player moves and after a random number of them forces
 * an encounter with a group of creatures from the current combat
 * zone.
 */
export class CombatEncounterComponent extends pow2.scene.SceneComponent {
  host:GameTileMap;
  battleCounter:number;
  combatFlag:boolean = false;
  combatZone:string = 'default';
  isDangerous:boolean = false;
  enabled:boolean = false;
  world:GameWorld = pow2.getWorld<GameWorld>('rpg');

  connectComponent():boolean {
    if (!super.connectComponent() || !(this.host instanceof GameTileMap)) {
      return false;
    }
    this.battleCounter = this.world.model.getKeyData('battleCounter');
    if (typeof this.battleCounter === 'undefined') {
      this.resetBattleCounter();
    }
    return true;
  }

  disconnectComponent():boolean {
    if (this.player) {
      this.player.off(null, null, this);
    }
    this.player = null;
    return super.disconnectComponent();
  }

  player:GameEntityObject = null;

  syncComponent():boolean {
    super.syncComponent();
    // Determine if the map wants this component to be enabled.
    this.enabled = this.host.map && this.host.map.properties && this.host.map.properties.combat;
    this.stopListening();
    this.player = null;
    if (this.host.scene) {
      this.player = <GameEntityObject>this.host.scene.objectByComponent(pow2.scene.components.PlayerComponent);
    }
    this.listenMoves();
    return !!this.player;
  }

  listenMoves() {
    this.stopListening();
    if (this.player && this.enabled) {
      this.player.on(pow2.scene.components.PlayerComponent.Events.MOVE_BEGIN, this.moveProcess, this);
    }
  }

  stopListening() {
    if (this.player) {
      this.player.off(null, null, this);
    }
  }

  moveProcess(player:pow2.scene.components.PlayerComponent, from:pow2.Point, to:pow2.Point) {
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
    var max:number = 255;
    var min:number = 64;
    this._setCounter(Math.floor(Math.random() * (max - min + 1)) + min);
    this.combatFlag = false;
  }

  triggerCombat(at:pow2.Point) {
    var zone:rpg.IZoneMatch = this.host.getCombatZones(at);
    zone.fixed = false;
    this.combatZone = zone.map || zone.target;
    console.log("Combat in zone : " + this.combatZone);
    this.stopListening();
    this.host.world.randomEncounter(zone, ()=> {
      this.resetBattleCounter();
      this.listenMoves();
    });
    this.combatFlag = true;
  }

  private _setCounter(value:number) {
    this.battleCounter = value;
    this.world.model.setKeyData('battleCounter', this.battleCounter);
  }
}
