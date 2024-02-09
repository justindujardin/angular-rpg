import { BehaviorSubject, Observable } from 'rxjs';
import { ITiledObject } from '../../core/resources/tiled/tiled.model';
import { GameWorld } from '../../services/game-world';
import { SceneView } from '../scene-view';
import { TileMap } from '../tile-map';
import { TileObject } from '../tile-object';

export class GameFeatureObject extends TileObject {
  world: GameWorld;

  feature: ITiledObject | null;

  setFeature(value: ITiledObject | null) {
    if (value?.gid) {
      this.gid = value.gid;
    }
    if (value?.properties?.icon) {
      this.icon = value.properties.icon;
    }
    if (value?.x) {
      this.point.x = Math.round(value.x / SceneView.UNIT);
    }
    if (value?.y) {
      this.point.y = Math.round(value.y / SceneView.UNIT);
    }
    this._feature$.next(value);
  }

  protected _feature$ = new BehaviorSubject<ITiledObject | null>(null);
  feature$: Observable<ITiledObject | null> = this._feature$;

  constructor(
    feature: ITiledObject | null = null,
    public tileMap: TileMap | null = null,
  ) {
    super();
    this.feature = feature;
  }
}
