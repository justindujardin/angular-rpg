import {ActivatedRouteSnapshot, CanActivate, CanDeactivate, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import 'rxjs/add/observable/of';
import {LoadingService} from '../../components/loading/loading.service';
import {GameWorld} from '../../services/game-world';
import {EditorComponent} from './editor.component';

@Injectable()
export class EditorGuards implements CanDeactivate<EditorComponent>, CanActivate {

  constructor(private world: GameWorld, private loadingService: LoadingService) {

  }

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
