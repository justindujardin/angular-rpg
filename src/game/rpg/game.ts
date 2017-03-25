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
import {Point} from '../pow-core/point';

/**
 * Describe a set of combat zones for a given point on a map.
 */
export interface IZoneMatch {
  /**
   * The zone name for the current map
   */
  map: string;
  /**
   * The zone name for the target location on the map
   */
  target: string;
  /**
   * The point that target refers to.
   */
  targetPoint: Point;

  /**
   * Fixed or random?
   */
  fixed: boolean;
}
