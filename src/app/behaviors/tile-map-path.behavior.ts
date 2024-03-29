import * as astar from 'javascript-astar';
import { Subscription } from 'rxjs';
import * as _ from 'underscore';
import { Point } from '../core';
import { TileMap } from '../scene/tile-map';
import { TileObjectBehavior } from './tile-object-behavior';

/**
 * A component that can calculate A-star paths.
 */
export class TileMapPathBehavior extends TileObjectBehavior {
  private _graph: any = null; // Astar graph object
  private _subscription: Subscription | null = null;

  public tileMap: TileMap;

  connectBehavior(): boolean {
    return super.connectBehavior() && !!this.tileMap;
  }

  syncBehavior(): boolean {
    this._subscription?.unsubscribe();
    this._subscription = this.tileMap.onLoaded$.subscribe(() => this._updateGraph());
    return super.syncBehavior();
  }

  disconnectBehavior(): boolean {
    this._subscription?.unsubscribe();
    this._subscription = null;
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
