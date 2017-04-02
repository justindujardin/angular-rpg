import {Component, AfterViewInit, ViewChildren, QueryList, OnDestroy, Input} from '@angular/core';
import {GameEntityObject} from '../../../game/rpg/objects/gameEntityObject';
import {CombatPlayerRenderBehaviorComponent} from './behaviors/combat-player-render.behavior';
import {SceneComponent} from '../../../game/pow2/scene/sceneComponent';
import {CombatAttackBehaviorComponent} from './behaviors/actions/combat-attack.behavior';
import {CombatComponent} from './combat.component';
import {Entity} from '../../models/entity/entity.model';
import {GameTileMap} from '../../../game/gameTileMap';
import {Observable} from 'rxjs';
import {GameStateService} from '../../models/game-state/game-state.service';
import {CombatEncounterBehaviorComponent} from './behaviors/combat-encounter.behavior';
import {PlayerBehaviorComponent} from './behaviors/player-behavior';
import {PlayerCameraBehaviorComponent} from './behaviors/player-camera.behavior';
import {PlayerMapPathBehaviorComponent} from './behaviors/player-map-path.behavior';
import {PlayerRenderBehaviorComponent} from './behaviors/player-render.behavior';
import {PlayerTouchBehaviorComponent} from './behaviors/player-touch.behavior';
import {Scene} from '../../../game/pow2/scene/scene';
import {Point} from '../../../game/pow-core/point';

@Component({
  selector: 'world-player',
  template: `
  <player-render-behavior #render></player-render-behavior>
  <collision-behavior #collision></collision-behavior>
  <player-map-path-behavior [map]="map" #path></player-map-path-behavior>
  <player-behavior #player></player-behavior>
  <player-camera-behavior #camera></player-camera-behavior>
  <player-touch-behavior #touch></player-touch-behavior>
  <ng-content></ng-content>
`
})
export class WorldPlayerComponent extends GameEntityObject implements AfterViewInit, OnDestroy {
  @ViewChildren('render,collision,path,player,camera,touch') behaviors: QueryList<SceneComponent>;

  @Input() model: Entity;
  @Input() scene: Scene;
  @Input() map: GameTileMap;
  @Input() point: Point;

  ngAfterViewInit(): void {
    this.setSprite(this.model.icon);
    this.scene.addObject(this);
    this.behaviors.forEach((c: SceneComponent) => {
      this.addBehavior(c);
    });
  }

  ngOnDestroy(): void {
    this.scene.removeObject(this);
    this.behaviors.forEach((c: SceneComponent) => {
      this.removeBehavior(c);
    });
    this.destroy();
  }

}

/** Components associated with world player */
export const WORLD_PLAYER_COMPONENTS = [
  WorldPlayerComponent,
  CombatEncounterBehaviorComponent,
  PlayerBehaviorComponent,
  PlayerCameraBehaviorComponent,
  PlayerMapPathBehaviorComponent,
  PlayerRenderBehaviorComponent,
  PlayerTouchBehaviorComponent
];
