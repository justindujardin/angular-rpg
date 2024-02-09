import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { GameStateSetKeyDataAction } from '../../../models/game-state/game-state.actions';
import { getGameKey } from '../../../models/selectors';
import { TileObject } from '../../../scene/tile-object';
import { IMapFeatureProperties, MapFeatureComponent } from '../map-feature.component';

export interface IDoorFeatureProperties extends IMapFeatureProperties {
  id: string;
  requiredKey?: string;
  icon: string;
  title: string;
  lockedText: string;
  unlockText: string;
}

@Component({
  selector: 'door-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./door-feature.component.scss'],
  templateUrl: './door-feature.component.html',
})
export class DoorFeatureComponent extends MapFeatureComponent {
  @Output() onClose = new EventEmitter();
  @Input() feature: ITiledObject<IDoorFeatureProperties> | null = null;
  active$: Observable<boolean>;
  requiredKey$: Observable<string> = this.feature$.pipe(
    map((f: ITiledObject) => {
      return f.properties?.requiredKey || '';
    }),
  );
  id$: Observable<string> = this.feature$.pipe(
    map((f: ITiledObject) => {
      return f.properties?.id || '';
    }),
  );
  canUnlock$: Observable<boolean> = this.feature$.pipe(
    switchMap((f: ITiledObject) => {
      if (!f.properties?.requiredKey) {
        return of(true);
      }
      return this.store.select(getGameKey(f.properties.requiredKey));
    }),
    map((value) => !!value),
  );
  cantUnlock$: Observable<boolean> = this.canUnlock$.pipe(map((value) => !value));
  icon$: Observable<string> = this.feature$.pipe(
    map((f: ITiledObject) => {
      return f.properties?.icon || '';
    }),
  );
  title$: Observable<string> = this.feature$.pipe(
    map((f: ITiledObject) => {
      return f.properties?.title || '';
    }),
  );
  lockedText$: Observable<string> = this.feature$.pipe(
    map((f: ITiledObject) => {
      return f.properties?.lockedText || '';
    }),
  );
  unlockText$: Observable<string> = this.feature$.pipe(
    map((f: ITiledObject) => {
      return f.properties?.unlockText || '';
    }),
  );

  exit(object: TileObject): boolean {
    if (!super.exit(object)) {
      return false;
    }
    this.canUnlock$
      .pipe(
        // Only once
        first(),
        // Determine if we should set the game data key
        map((canUnlock: boolean) => {
          if (!canUnlock || !this.feature?.properties?.id) {
            return;
          }
          this.store.dispatch(
            new GameStateSetKeyDataAction(this.feature.properties.id, true),
          );
        }),
      )
      .subscribe();
    return true;
  }
}
