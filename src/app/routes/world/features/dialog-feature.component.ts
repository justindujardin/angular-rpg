import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.model';
import { GameStateSetKeyDataAction } from 'app/models/game-state/game-state.actions';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { IScene } from '../../../scene/scene.model';
import { TileObject } from '../../../scene/tile-object';
import { TiledFeatureComponent } from '../map-feature.component';

@Component({
  selector: 'dialog-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./dialog-feature.component.scss'],
  templateUrl: './dialog-feature.component.html',
})
export class DialogFeatureComponent extends TiledFeatureComponent {
  // @ts-ignore
  @Input() feature: ITiledObject | null;
  @Input() scene: IScene | null;
  // @ts-ignore
  @Input() active: boolean;
  @Output() onClose = new EventEmitter();
  active$: Observable<boolean>;

  /** The dialog text */
  text$: Observable<string> = this.feature$.pipe(
    map((f: ITiledObject) => {
      return f.properties.text;
    })
  );

  /** The dialog title */
  title$: Observable<string> = this.feature$.pipe(
    map((f: ITiledObject) => {
      return f.properties.title;
    })
  );

  /** The icon to display for the dialog speaker */
  icon$: Observable<string> = this.feature$.pipe(
    map((f: ITiledObject) => {
      // Resolve tile images from their gid
      if (f.gid && this.host?.tileMap) {
        const meta = this.host.tileMap.getTileMeta(f.gid);
        if (meta?.image) {
          return meta?.image;
        }
      }
      // Fallback to using the "icon" custom property
      return f.properties.icon;
    })
  );

  /** An optional additional icon to display for the dialog */
  altIcon$: Observable<string> = this.feature$.pipe(
    map((f: ITiledObject) => {
      return f.properties.altIcon;
    })
  );

  constructor(private store: Store<AppState>) {
    super();
  }

  exit(object: TileObject): boolean {
    const result = super.exit(object);
    if (result) {
      // Check to see if this dialog should set game key/value data
      const sets = this.feature?.properties?.sets;
      if (sets) {
        this.store.dispatch(new GameStateSetKeyDataAction(sets, true));
      }
    }
    return result;
  }
}
