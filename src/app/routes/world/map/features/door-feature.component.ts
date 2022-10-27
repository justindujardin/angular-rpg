import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { AppState } from '../../../../../app/app.model';
import { GameStateSetKeyDataAction } from '../../../../../app/models/game-state/game-state.actions';
import { getGameKey } from '../../../../../app/models/selectors';
import { IScene } from '../../../../scene/scene.model';
import { TileObject } from '../../../../scene/tile-object';
import { TiledFeatureComponent, TiledMapFeatureData } from '../map-feature.component';

export interface IDoorFeatureTiledProperties {
  id: string;
  requiredKey: string;
  icon: string;
  title: string;
  lockedText: string;
  unlockText: string;
}

export type DoorFeatureType = TiledMapFeatureData<IDoorFeatureTiledProperties>;

@Component({
  selector: 'door-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./door-feature.component.scss'],
  templateUrl: './door-feature.component.html',
})
export class DoorFeatureComponent extends TiledFeatureComponent {
  // @ts-ignore
  @Input() feature: DoorFeatureType;
  @Input() scene: IScene;
  // @ts-ignore
  @Input() active: boolean;
  @Output() onClose = new EventEmitter();
  active$: Observable<boolean>;
  requiredKey$: Observable<string> = this.feature$.pipe(
    map((f: DoorFeatureType) => {
      return f.properties.requiredKey;
    })
  );
  id$: Observable<string> = this.feature$.pipe(
    map((f: DoorFeatureType) => {
      return f.properties.id;
    })
  );
  canUnlock$: Observable<boolean> = this.feature$.pipe(
    switchMap((f: DoorFeatureType) => {
      if (!f.properties.requiredKey) {
        return of(true);
      }
      return this.store.select(getGameKey(f.properties.requiredKey));
    }),
    map((value) => !!value)
  );
  cantUnlock$: Observable<boolean> = this.canUnlock$.pipe(map((value) => !value));
  icon$: Observable<string> = this.feature$.pipe(
    map((f: DoorFeatureType) => {
      return f.properties.icon;
    })
  );
  title$: Observable<string> = this.feature$.pipe(
    map((f: DoorFeatureType) => {
      return f.properties.title;
    })
  );
  lockedText$: Observable<string> = this.feature$.pipe(
    map((f: DoorFeatureType) => {
      return f.properties.lockedText;
    })
  );
  unlockText$: Observable<string> = this.feature$.pipe(
    map((f: DoorFeatureType) => {
      return f.properties.unlockText;
    })
  );

  constructor(public store: Store<AppState>) {
    super();
  }

  enter(object: TileObject): boolean {
    if (!super.enter(object)) {
      return false;
    }
    this.active$
      .pipe(
        // Wait for active to change
        filter((v) => v === false),
        // Only once
        first(),
        // Gather the args we want
        switchMap(() => this.canUnlock$),
        // Determine if we should set the game data key
        map((canUnlock: boolean) => {
          if (!canUnlock) {
            return;
          }
          this.store.dispatch(new GameStateSetKeyDataAction(this.properties.id, true));
        })
      )
      .subscribe();
    return true;
  }
}
