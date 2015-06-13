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

/// <reference path="../playerComponent.ts" />
/// <reference path="../gameFeatureComponent.ts" />

module rpg.components.features {
  export class ShipFeatureComponent extends GameFeatureComponent {
    party:pow2.scene.components.PlayerComponent;
    partyObject:pow2.tile.TileObject;
    partySprite:string;
    private _tickInterval:number = -1;

    syncComponent():boolean {
      if (super.syncComponent()) {
        var gameWorld:GameWorld = <GameWorld>this.host.world;
        if (gameWorld && gameWorld.state) {
          var gameState:rpg.models.GameStateModel = gameWorld.state.model;
          var location = gameState.getKeyData('shipPosition');
          if (location) {
            this.host.setPoint(new pow2.Point(location.x, location.y));
          }
        }
      }
      return false;
    }

    enter(object:rpg.objects.GameFeatureObject):boolean {
      // Must have a party component to board a ship.  Don't want buildings
      // and NPCs boarding ships... or do we?  [maniacal laugh]
      this.party = <pow2.scene.components.PlayerComponent>
          object.findComponent(pow2.scene.components.PlayerComponent);
      if (!this.party) {
        return false;
      }
      this.partySprite = object.icon;
      this.party.passableKeys = ['shipPassable'];
      return true;
    }

    entered(object:rpg.objects.GameFeatureObject):boolean {
      return this.board(object);
    }

    /**
     * Board an object onto the ship component.  This will modify the
     * @param object
     */
    board(object:rpg.objects.GameFeatureObject):boolean {
      if (this.partyObject || !this.party) {
        return false;
      }
      this.partyObject = object;
      object.setSprite(this.host.icon);
      this.host.visible = false;
      this.host.enabled = false;

      this._tickInterval = setInterval(()=> {
        if (this.partyObject.point.equal(this.party.targetPoint) && !this.party.heading.isZero()) {
          var from:pow2.Point = this.partyObject.point;
          var to:pow2.Point = from.clone().add(this.party.heading);
          if (!this.party.collideWithMap(from, 'shipPassable') && !this.party.collideWithMap(to, 'passable')) {
            this.disembark(from, to, this.party.heading.clone());
          }
        }
      }, 32);
      return true;
    }

    disembark(from:pow2.Point, to:pow2.Point, heading:pow2.Point) {
      clearInterval(this._tickInterval);
      this.partyObject.setSprite(this.partySprite);
      this.party.targetPoint.set(to);
      this.party.velocity.set(heading);
      this.party.passableKeys = ['passable'];
      this.host.point.set(from);
      this.host.visible = true;
      this.host.enabled = true;
      this.partyObject = null;
      this.party = null;

      var gameWorld:GameWorld = <GameWorld>this.host.world;
      if (gameWorld && gameWorld.state && gameWorld.state.model) {
        gameWorld.state.model.setKeyData('shipPosition', this.host.point);
      }
    }
  }
}