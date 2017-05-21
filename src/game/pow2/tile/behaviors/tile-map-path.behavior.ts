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
import * as _ from 'underscore';
import {TileObjectBehavior} from '../tile-object-behavior';
import {TileMap} from '../tile-map';
import {Point} from '../../../pow-core/point';
import * as astar from 'javascript-astar';

/**
 * A component that can calculate A-star paths.
 */
export class TileMapPathBehavior extends TileObjectBehavior {

  _graph: any = null; // Astar graph object

  public tileMap: TileMap;

  connectBehavior(): boolean {
    return super.connectBehavior() && !!this.tileMap;
  }

  syncBehavior(): boolean {
    this.tileMap.off(TileMap.Events.LOADED, this._updateGraph, this);
    this.tileMap.on(TileMap.Events.LOADED, this._updateGraph, this);
    return super.syncBehavior();
  }

  disconnectBehavior(): boolean {
    this.tileMap.off(TileMap.Events.LOADED, this._updateGraph, this);
    this._graph = null;
    return super.disconnectBehavior();
  }

  protected _updateGraph() {
    const nodes = this.buildWeightedGraph();
    this._graph = new astar.Graph(nodes);
  }

  /**
   * Build a two-dimensional graph of numbers that represent the map
   * to find paths on.  The higher the value at an index, the more
   * difficult it is to traverse.
   *
   * A grid might look like this:
   *
   *     [5,5,1,5]
   *     [1,1,1,5]
   *     [5,5,5,5]
   *
   */
  buildWeightedGraph(): number[][] {
    return [[]];
  }

  /**
   * Calculate the best path from one point to another in the current
   * A* graph.
   */
  calculatePath(from: Point, to: Point): Point[] {
    if (!this._graph) {
      this._updateGraph();
    }
    if (!this._graph || !this._graph.grid) {
      throw new Error('Invalid AStar graph');
    }
    this._graph.init();
    // Treat out of range errors as non-critical, and just
    // return an empty array.
    if (from.x >= this._graph.grid.length || from.x < 0) {
      return [];
    }
    if (from.y >= this._graph.grid[from.x].length) {
      return [];
    }
    if (to.x >= this._graph.grid.length || to.x < 0) {
      return [];
    }
    if (to.y >= this._graph.grid[to.x].length) {
      return [];
    }
    const start = this._graph.grid[from.x][from.y];
    const end = this._graph.grid[to.x][to.y];
    const result = astar.astar.search(this._graph, start, end);
    return _.map(result, (graphNode: any) => {
      return new Point(graphNode.x, graphNode.y);
    });
  }
}
