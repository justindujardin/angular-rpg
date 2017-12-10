import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {getGameMap} from '../../models/selectors';
import {AppState} from '../../app.model';
import {Store} from '@ngrx/store';
import {ResourceManager} from '../../../game/pow-core/resource-manager';
import {getMapUrl} from '../../../game/pow2/core/api';
import {TiledMapLoader} from './formats/tiled-map-loader';
import {EditableTileMap} from './formats/editable-map';

@Component({
  selector: 'editor',
  styleUrls: ['./editor.component.scss'],
  templateUrl: './editor.component.html'
})
export class EditorComponent implements OnInit {

  map$: Observable<string> = this.store.select(getGameMap);

  editable$: Observable<EditableTileMap> = this.map$.switchMap((map: string) => {
    const mapUrl: string = getMapUrl(map);
    return Observable.fromPromise(this.tiledLoader.load(mapUrl));
  });

  constructor(public store: Store<AppState>,
              public tiledLoader: TiledMapLoader,
              public loader: ResourceManager) {
  }

  ngOnInit() {
    // HACKS: Remove this test code.
    this.map$.take(1).subscribe((map) => {
      console.log('map iz -> ' + map);
      const mapUrl: string = getMapUrl(map);
      this.tiledLoader.load(mapUrl).then((r) => {
        console.log('loaded editable map');
        console.log(r);
      });
      this.loader.load(mapUrl).then((r) => {
        console.log('loaded map');
        console.log(r);
      });

    });
    console.log('the +editor is loaded. shipit.');
  }

}
