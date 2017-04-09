import {TiledFeatureComponent, TiledMapFeatureData} from '../map-feature.component';
import {TileObject} from '../../../../../game/pow2/tile/tileObject';
import {Component, Input, ViewEncapsulation, ChangeDetectionStrategy, EventEmitter, Output} from '@angular/core';
import {Observable, BehaviorSubject} from 'rxjs';
import {IScene} from '../../../../../game/pow2/interfaces/IScene';

@Component({
  selector: 'dialog-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./dialog-feature.component.scss'],
  templateUrl: './dialog-feature.component.html'
})
export class DialogFeatureComponent extends TiledFeatureComponent {

  @Input() feature: TiledMapFeatureData;

  enter(object: TileObject): boolean {
    this.assertFeature();
    this.active = true;
    return true;
  }

  exit(object: TileObject): boolean {
    this.assertFeature();
    this.active = false;
    return true;
  }

  @Output() onClose = new EventEmitter();

  @Input() scene: IScene;

  text$: Observable<string> = this.feature$.map((f: TiledMapFeatureData) => {
    return f.properties.text;
  });

  title$: Observable<string> = this.feature$.map((f: TiledMapFeatureData) => {
    return f.properties.title;
  });
  icon$: Observable<string> = this.feature$.map((f: TiledMapFeatureData) => {
    return f.properties.icon;
  });

  private _active$ = new BehaviorSubject<boolean>(false);
  active$: Observable<boolean> = this._active$;

  @Input()
  set active(value: boolean) {
    this._active$.next(value);
  }

}
