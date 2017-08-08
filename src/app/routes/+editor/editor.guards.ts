import {ActivatedRouteSnapshot, CanActivate, CanDeactivate, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {EditorComponent} from './editor.component';

@Injectable()
export class EditorGuards implements CanDeactivate<EditorComponent>, CanActivate {

  /** The route cannot deactivate without prompting the user if there are unsaved changes */
  canDeactivate(component: EditorComponent,
                currentRoute: ActivatedRouteSnapshot,
                currentState: RouterStateSnapshot,
                nextState?: RouterStateSnapshot) {
    return true;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return true;
  }

}
