import {RouterStateSnapshot, ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../../app.model';
import {Observable} from 'rxjs/Rx';
import {GameState} from '../../models/game-state/game-state.model';
import {getGameState} from '../../models/game-state/game-state.reducer';

@Injectable()
export class CanActivateCombat implements CanActivate {
  constructor(private store: Store<AppState>, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return getGameState(this.store).map((g: GameState) => {
      if (!g.combatZone) {
        return false;
      }
      return true;
    });
  }
}
