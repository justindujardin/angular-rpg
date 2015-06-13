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

module rpg {

  export var COMBAT_ENCOUNTERS = {
    FIXED: "fixed",
    RANDOM: "random"
  };

  export interface IGameEncounter {
    type:string; // @see pow2.ENCOUNTERS
    id:string; // unique id in spreadsheet
    zones:string[]; // array of zones this encounter can happen in
    enemies:string[]; // array of enemies in this encounter
  }

  export interface IGameEncounterCallback {
    (victory:boolean):void;
  }
}