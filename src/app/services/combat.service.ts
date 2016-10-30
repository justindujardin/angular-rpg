import {Injectable, Inject, forwardRef} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs/Rx';
import {ResourceLoader} from '../../game/pow-core/resourceLoader';
import {GameWorld} from './gameWorld';
import {GameTileMap} from '../../game/gameTileMap';
import {CombatEncounter} from '../models/combat/combat.model';
import {PartyMember} from '../models/party-member.model';
import {AppState} from '../app.model';
import {Store} from '@ngrx/store';
import {getParty} from '../models/game-state/game-state.reducer';
import {GameEntityObject} from '../../game/rpg/objects/gameEntityObject';
import {getMapUrl} from '../../game/pow2/core/api';
import {TiledTMXResource} from '../../game/pow-core/resources/tiled/tiledTmx';
import {IZoneMatch} from '../../game/rpg/game';

function myObservable(observer) {
  const datasource = null;
  datasource.ondata = (e) => observer.next(e);
  datasource.onerror = (err) => observer.error(err);
  datasource.oncomplete = () => observer.complete();
  return () => {
    datasource.destroy();
  };
}

function map(source, project) {
  return new Observable((observer) => {
    const mapObserver = {
      next: (x) => observer.next(project(x)),
      error: (err) => observer.error(err),
      complete: () => observer.complete()
    };
    return source.subscribe(mapObserver);
  });
}

@Injectable()
export class CombatService {

  constructor(@Inject(forwardRef(() => GameWorld)) private gameWorld: GameWorld,
              private store: Store<AppState>,
              private resourceLoader: ResourceLoader) {
  }

  private _combatMap$ = new ReplaySubject<GameTileMap>(1);
  combatMap$: Observable<GameTileMap> = this._combatMap$;

  buildParty(encounter: CombatEncounter): Observable<GameEntityObject> {
    return getParty(this.store).map((party: PartyMember[]) => {

    });
  }

  loadCombatMap(combatZone: string): Observable<GameTileMap> {
    const mapUrl = getMapUrl('combat');
    return Observable.fromPromise(this.resourceLoader.load(mapUrl)
      .then((maps: TiledTMXResource[]) => {
        if (!maps[0] || !maps[0].data) {
          return Promise.reject('invalid resource: ' + mapUrl);
        }
        const inputs = {
          resource: maps[0]
        };
        return this.gameWorld.entities.createObject('GameCombatMap', inputs);
      })
      .then((g: GameTileMap) => {
        // Hide all layers that don't correspond to the current combat zone
        g.getLayers().forEach((l) => {
          l.visible = (l.name === combatZone);
        });
        g.dirtyLayers = true;
        this._combatMap$.next(g);
        return g;
      }));

  }

  loadEncounter(encounter: CombatEncounter): Observable<CombatEncounter> {
    return this.loadCombatMap(encounter.zone).map((m: GameTileMap) => {

    });
    // return Observable.create((observer: Observer) => {
    //   observer.next(42);
    //   observer.complete();
    //
    //   // Any cleanup logic might go here
    //   return () => {
    //     console.log('disposed')
    //   };
    // });

    // machine.world.mark(this.scene);
    const spreadsheet = this.parent.world.spreadsheet;
    if (!this.factory || !spreadsheet) {
      throw new Error("Invalid combat entity container or game data spreadsheet");
    }

    let promise: Promise<any> = Promise.resolve();

    // Build party
    _.each(this.gameWorld.model.party, (hero: PartyMember, index: number) => {
      const config = {
        model: hero,
        combat: this
      };
      promise = promise.then(() => {
        return this.factory.createObject('CombatPlayer', config)
          .then((heroEntity: GameEntityObject) => {
            if (!heroEntity.isDefeated()) {
              heroEntity.icon = hero.get('icon');
              this.machine.party.push(heroEntity);
              this.scene.addObject(heroEntity);
            }
          });
      })
    });


    promise
      .then(() => {
        var mapUrl: string = getMapUrl('combat');
        return machine.world.loader.load(mapUrl);
      })
      .then((maps: TiledTMXResource[]) => {
        return this.factory.createObject('GameCombatMap', {
          resource: maps[0]
        });
      })
      .then((map: GameTileMap) => {
        this.tileMap = map;
        // Hide all layers that don't correspond to the current combat zone
        var zone: IZoneMatch = machine.encounterInfo;
        var visibleZone: string = zone.target || zone.map;
        _.each(this.tileMap.getLayers(), (l) => {
          l.visible = (l.name === visibleZone);
        });
        this.tileMap.dirtyLayers = true;
        this.scene.addObject(this.tileMap);

        // Position Party/Enemies
        let enemyPromises = [];

        // Get enemies data from spreadsheet
        var enemyList: any[] = spreadsheet.getSheetData("enemies");
        var enemiesLength: number = machine.encounter.enemies.length;
        for (var i: number = 0; i < enemiesLength; i++) {
          var tpl = _.where(enemyList, {id: machine.encounter.enemies[i]});
          if (tpl.length === 0) {
            continue;
          }
          var enemyModel = new CreatureModel(tpl[0]);

          let createEnemyPromise = this.factory.createObject('CombatEnemy', {
            model: enemyModel,
            combat: this,
            sprite: {
              name: "enemy",
              icon: enemyModel.get('icon')
            }
          });
          createEnemyPromise = createEnemyPromise.then((nme: GameEntityObject) => {
            if (!nme) {
              throw new Error("Entity failed to validate with given inputs");
            }
            this.scene.addObject(nme);
            this.machine.enemies.push(nme);
          });
          enemyPromises.push(createEnemyPromise);
        }
        return Promise.all(enemyPromises);
      })
      .then(() => {

        if (this.machine.enemies.length) {
          _.each(this.machine.party, (heroEntity: GameEntityObject, index: number) => {
            var battleSpawn = this.tileMap.getFeature('p' + (index + 1));
            heroEntity.setPoint(new Point(battleSpawn.x / 16, battleSpawn.y / 16));
          });

          _.each(this.machine.enemies, (enemyEntity: GameEntityObject, index: number) => {
            var battleSpawn = this.tileMap.getFeature('e' + (index + 1));
            if (battleSpawn) {
              enemyEntity.setPoint(new Point(battleSpawn.x / 16, battleSpawn.y / 16));
            }
          });
          machine.trigger('combat:begin', this);
          this.machine.update(this);
        }
        else {
          // TODO: This is an error, I think.  Player entered combat with no valid enemies.
          machine.trigger('combat:end', this);
        }

      });
  }

}
