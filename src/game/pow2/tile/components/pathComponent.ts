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

import {TileComponent} from '../tileComponent';
import {TileMap} from '../tileMap';
import {Point} from '../../../pow-core/point';
declare var astar: any;
declare var Graph: any;

/**
 * A component that can calculate A-star paths.
 */
export class PathComponent extends TileComponent {

  _graph: any = null; // Astar graph object

  constructor(public tileMap: TileMap) {
    super();
  }

  connectComponent(): boolean {
    return super.connectComponent() && !!this.tileMap;
  }

  syncComponent(): boolean {
    this.tileMap.off(TileMap.Events.LOADED, this._updateGraph, this);
    this.tileMap.on(TileMap.Events.LOADED, this._updateGraph, this);
    return super.syncComponent();
  }

  disconnectComponent(): boolean {
    this.tileMap.off(TileMap.Events.LOADED, this._updateGraph, this);
    this._graph = null;
    return super.disconnectComponent();
  }

  private _updateGraph() {
    this._graph = new Graph(this.buildWeightedGraph());
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
    if (!this._graph || !this._graph.nodes) {
      throw new Error("Invalid AStar graph");
    }
    // Treat out of range errors as non-critical, and just
    // return an empty array.
    if (from.x >= this._graph.nodes.length || from.x < 0) {
      return [];
    }
    if (from.y >= this._graph.nodes[from.x].length) {
      return [];
    }
    if (to.x >= this._graph.nodes.length || to.x < 0) {
      return [];
    }
    if (to.y >= this._graph.nodes[to.x].length) {
      return [];
    }
    var start = this._graph.nodes[from.x][from.y];
    var end = this._graph.nodes[to.x][to.y];
    var result = astar.search(this._graph.nodes, start, end);
    return _.map(result, (graphNode: any) => {
      return new Point(graphNode.pos.x, graphNode.pos.y);
    });
  }
}
