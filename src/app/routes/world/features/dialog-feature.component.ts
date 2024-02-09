import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { GameStateSetKeyDataAction } from 'app/models/game-state/game-state.actions';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { TileObject } from '../../../scene/tile-object';
import { IMapFeatureProperties, MapFeatureComponent } from '../map-feature.component';

export interface IDialogFeatureProperties extends IMapFeatureProperties {
  text: string;
  title: string;
  icon: string;
  altIcon?: string;
  sets?: string;
}

@Component({
  selector: 'dialog-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./dialog-feature.component.scss'],
  templateUrl: './dialog-feature.component.html',
})
export class DialogFeatureComponent extends MapFeatureComponent {
  @Output() onClose = new EventEmitter();
  @Input() feature: ITiledObject<IDialogFeatureProperties> | null = null;

  /** The dialog text */
  text$: Observable<string> = this.feature$.pipe(
    map((f: ITiledObject) => {
      return f.properties.text;
    }),
  );

  /** The dialog title */
  title$: Observable<string> = this.feature$.pipe(
    map((f: ITiledObject) => {
      return f.properties.title;
    }),
  );

  /** The icon to display for the dialog speaker */
  icon$: Observable<string> = this.feature$.pipe(
    map((f: ITiledObject) => {
      // Resolve tile images from their gid
      if (f.gid && this.tileMap) {
        const meta = this.tileMap.getTileMeta(f.gid);
        if (meta?.image) {
          return meta?.image;
        }
      }
      // Fallback to using the "icon" custom property
      return f.properties.icon;
    }),
  );

  /** An optional additional icon to display for the dialog */
  altIcon$: Observable<string> = this.feature$.pipe(
    map((f: ITiledObject) => {
      return f.properties.altIcon;
    }),
  );

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
