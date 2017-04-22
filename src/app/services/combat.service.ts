import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs/Rx';
import {ResourceManager} from '../../game/pow-core/resource-manager';
import {CombatEncounter} from '../models/combat/combat.model';
import {getMapUrl} from '../../game/pow2/core/api';
import {TiledTMXResource} from '../../game/pow-core/resources/tiled/tiled-tmx.resource';
import {BaseEntity} from '../models/base-entity';
import {ITiledLayer} from '../../game/pow-core/resources/tiled/tiled.model';

@Injectable()
export class CombatService {

  constructor(private resourceLoader: ResourceManager) {
  }

  private _combatMap$ = new ReplaySubject<TiledTMXResource>(1);
  combatMap$: Observable<TiledTMXResource> = this._combatMap$;

  loadMap(combatZone: string): Observable<TiledTMXResource> {
    const mapUrl = getMapUrl('combat');
    return Observable.fromPromise(this.resourceLoader.load(mapUrl)
      .then((maps: TiledTMXResource[]) => {
        if (!maps[0] || !maps[0].data) {
          return null;
        }
        const result: TiledTMXResource = maps[0];
        // Hide all layers that don't correspond to the current combat zone
        result.layers.forEach((l: ITiledLayer) => {
          l.visible = (l.name === combatZone);
        });
        this._combatMap$.next(result);
        return result;
      }));
  }

  loadEncounter(encounter: CombatEncounter): Observable<CombatEncounter> {
    return this.loadMap(encounter.zone).map(() => encounter);
  }

  attack(from: BaseEntity, to: BaseEntity) {
    // todo
  }
}
