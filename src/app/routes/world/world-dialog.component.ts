/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import {Component, Input, ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';
import {DialogFeatureComponent} from '../../../game/rpg/components/features/dialogFeatureComponent';
import {IScene} from '../../../game/pow2/interfaces/IScene';
import {BehaviorSubject, Observable} from 'rxjs';

@Component({
  selector: 'world-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./world-dialog.component.scss'],
  templateUrl: './world-dialog.component.html'
})
export class WorldDialog {

  static DEFAULT_TEXT: string = 'Nothing to see here';
  static DEFAULT_TITLE: string = 'Untitled';

  @Input() scene: IScene;

  private _text$ = new BehaviorSubject<string>(WorldDialog.DEFAULT_TEXT);
  text$: Observable<string> = this._text$;

  @Input()
  set text(value: string) {
    this._text$.next(value);
  }

  private _title$ = new BehaviorSubject<string>(WorldDialog.DEFAULT_TITLE);
  title$: Observable<string> = this._title$;

  @Input()
  set title(value: string) {
    this._title$.next(value);
  }

  private _icon$ = new BehaviorSubject<string>('');
  icon$: Observable<string> = this._icon$;

  @Input()
  set icon(value: string) {
    this._icon$.next(value);
  }

  private _active$ = new BehaviorSubject<boolean>(false);
  active$: Observable<boolean> = this._active$;

  @Input()
  set active(value: boolean) {
    this._active$.next(value);
  }

  @Input()
  set feature(feature:DialogFeatureComponent) {
    this.active = true;
    this.icon = feature.icon;
    this.text = feature.text;
    this.title = feature.title;
  }
}
