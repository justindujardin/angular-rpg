import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CanActivateWorld} from './world.guards';
import {EditorComponent} from './editor.component';
import {EditorGuards} from './editor.guards';
import {RouterModule} from '@angular/router';
import {routes} from './editor.routes';
import {BehaviorsModule} from '../../behaviors/index';
import {ServicesModule} from '../../services/index';
import {PowCoreModule} from '../../../game/pow-core/index';
import {TiledMapLoader} from './formats/tiled-map-loader';

export const EDITOR_PROVIDERS = [
  EditorGuards,
  TiledMapLoader
];

export const EDITOR_EXPORTS = [
  EditorComponent
];

@NgModule({
  declarations: EDITOR_EXPORTS,
  providers: EDITOR_PROVIDERS,
  exports: EDITOR_EXPORTS,
  imports: [
    BehaviorsModule,
    ServicesModule,
    PowCoreModule,
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class EditorModule {
  public static routes = routes;
}

console.log('AngularRPG Editor loaded.');
