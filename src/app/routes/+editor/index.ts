import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CanActivateWorld} from './world.guards';
import {EditorComponent} from './editor.component';
import {EditorGuards} from './editor.guards';
import {RouterModule} from '@angular/router';
import {routes} from './editor.routes';

export const EDITOR_PROVIDERS = [
  EditorGuards
];

export const EDITOR_EXPORTS = [
  EditorComponent
];

@NgModule({
  declarations: EDITOR_EXPORTS,
  providers: EDITOR_PROVIDERS,
  exports: EDITOR_EXPORTS,
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class EditorModule {
  public static routes = routes;
}

console.log('AngularRPG Editor loaded.');

