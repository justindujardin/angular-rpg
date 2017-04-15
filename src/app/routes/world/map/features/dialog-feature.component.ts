import {TiledFeatureComponent, TiledMapFeatureData} from '../map-feature.component';
import {Component, Input, ViewEncapsulation, ChangeDetectionStrategy, EventEmitter, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {IScene} from '../../../../../game/pow2/scene/scene.model';

@Component({
  selector: 'dialog-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./dialog-feature.component.scss'],
  templateUrl: './dialog-feature.component.html'
})
export class DialogFeatureComponent extends TiledFeatureComponent {
  @Input() feature: TiledMapFeatureData;
  @Input() scene: IScene;
  @Input() active: boolean;
  @Output() onClose = new EventEmitter();
  active$: Observable<boolean>;

  /** The dialog text */
  text$: Observable<string> = this.feature$.map((f: TiledMapFeatureData) => {
    return f.properties.text;
  });

  /** The dialog title */
  title$: Observable<string> = this.feature$.map((f: TiledMapFeatureData) => {
    return f.properties.title;
  });

  /** The icon to display for the dialog speaker */
  icon$: Observable<string> = this.feature$.map((f: TiledMapFeatureData) => {
    return f.properties.icon;
  });

}
