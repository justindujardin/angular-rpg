import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IScene } from '../../../../../game/pow2/scene/scene.model';
import { TiledFeatureComponent, TiledMapFeatureData } from '../map-feature.component';

@Component({
  selector: 'dialog-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./dialog-feature.component.scss'],
  templateUrl: './dialog-feature.component.html',
})
export class DialogFeatureComponent extends TiledFeatureComponent {
  // @ts-ignore
  @Input() feature: TiledMapFeatureData;
  @Input() scene: IScene;
  // @ts-ignore
  @Input() active: boolean;
  @Output() onClose = new EventEmitter();
  active$: Observable<boolean>;

  /** The dialog text */
  text$: Observable<string> = this.feature$.pipe(
    map((f: TiledMapFeatureData) => {
      return f.properties.text;
    })
  );

  /** The dialog title */
  title$: Observable<string> = this.feature$.pipe(
    map((f: TiledMapFeatureData) => {
      return f.properties.title;
    })
  );

  /** The icon to display for the dialog speaker */
  icon$: Observable<string> = this.feature$.pipe(
    map((f: TiledMapFeatureData) => {
      return f.properties.icon;
    })
  );
}
