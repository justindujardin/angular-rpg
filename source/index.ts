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

/// <reference path="../typings/angular2/angular2.d.ts"/>
/// <reference path="../typings/es6-promise/es6-promise.d.ts"/>
/// <reference path="../bower_components/pow2/lib/pow2.d.ts" />
/// <reference path="../bower_components/pow2/types/backbone/backbone.d.ts" />

import {bootstrap} from 'angular2/angular2';


/**
 * A Combat encounter descriptor.  Used to describe the configuration of combat.
 */
export interface IGameEncounter {
  type:string; // @see pow2.ENCOUNTERS
  id:string; // unique id in spreadsheet
  zones:string[]; // array of zones this encounter can happen in
  enemies:string[]; // array of enemies in this encounter
  message:string; // message to display when combat begins
}

/**
 * Callback when
 */
export interface IGameEncounterCallback {
  (victory:boolean):void;
}

//
// Models
//
export interface IGameItem {
  id?:string; // the `hyphen-case-named` item id
  name:string; // The item name
  cost:number; // The cost of this item
  icon:string; // Sprite icon name, e.g. LongSword.png
  usedby?:any[]; // `HeroType`s that can use this item.
}

export interface IGameUsable extends IGameItem {
  effects:string[]; // Array of effects to apply to user of item
}

export interface IGameSpell extends IGameItem {
  type:string; // apply on 'target' or 'group'
  elements:string; // what kind of magic
  benefit:boolean; // hurt/heal
  value:number; // the impact
  level:number; // minimum level to use the spell
}

export interface IGameWeapon extends IGameItem {
  attack:number; // Damage value
  hit:number; // 0-100%
}

export interface IGameArmor extends IGameItem {
  defense:number; // Defensive value
  evade:number; // Value to add to evasion <= 0
}


/**
 * Describe a set of combat zones for a given point on a map.
 */
export interface IZoneMatch {
  /**
   * The zone name for the current map
   */
  map:string;
  /**
   * The zone name for the target location on the map
   */
  target:string;
  /**
   * The point that target refers to.
   */
  targetPoint:pow2.Point;
}

// HeroView directive
// ----------------------------------------------------------------------------
//  app.directive('heroCard', function () {
//    return {
//      restrict: 'E',
//      scope: true,
//      templateUrl: 'games/rpg/directives/heroCard.html',
//      link: function ($scope:any, element, attrs) {
//        $scope.hero = attrs.hero;
//        $scope.$watch(attrs.hero, function (hero) {
//          $scope.hero = hero;
//        });
//      }
//    };
//  });
