import {Component, AfterViewInit, OnDestroy, ViewChildren, QueryList, Input} from '@angular/core';
import {CombatPlayerRenderBehaviorComponent} from './behaviors/combat-player-render.behavior';
import {SceneComponent} from '../../../game/pow2/scene/sceneComponent';
import {CombatAttackBehaviorComponent} from './behaviors/actions/combat-attack.behavior';
import {CombatComponent} from './combat.component';
import {GameTileMap} from '../../../game/gameTileMap';
import {Subscription} from 'rxjs';
import {GameStateService} from '../../models/game-state/game-state.service';
import {TiledTMXResource} from '../../../game/pow-core/resources/tiled/tiledTmx';
import {ResourceLoader} from '../../../game/pow-core/resourceLoader';
import {Behavior} from '../../../game/pow-core/behavior';
import {MapFeatureInputBehaviorComponent} from './behaviors/map-feature-input.behavior';
import {Scene} from '../../../game/pow2/scene/scene';

@Component({
  selector: 'world-map',
  template: `
  <map-feature-input-behavior #input></map-feature-input-behavior>
  <combat-encounter-behavior #encounter></combat-encounter-behavior>
  <ng-content></ng-content>
`
})
export class WorldMapComponent extends GameTileMap implements AfterViewInit, OnDestroy {

  @Input() scene: Scene;

  @ViewChildren('input,encounter') behaviors: QueryList<Behavior>;

  /** The {@see TiledTMXResource} map at the input url */
  private _resource$: Subscription = this.gameStateService.worldMap$
    .distinctUntilChanged()
    .debounceTime(1000)
    .do((result: TiledTMXResource) => {
      this.setMap(result);
    })
    .subscribe();

  constructor(public gameStateService: GameStateService, public loader: ResourceLoader) {
    super();
  }

  ngAfterViewInit(): void {
    this.scene.addObject(this);
    this.behaviors.forEach((c: SceneComponent) => {
      this.addBehavior(c);
    });
  }

  ngOnDestroy(): void {
    this.scene.removeObject(this);
    this._resource$.unsubscribe();
    this.behaviors.forEach((c: SceneComponent) => {
      this.removeBehavior(c);
    });
    this.destroy();
  }

}

/** Components associated with world map */
export const WORLD_MAP_COMPONENTS = [
  WorldMapComponent,
  MapFeatureInputBehaviorComponent
];
