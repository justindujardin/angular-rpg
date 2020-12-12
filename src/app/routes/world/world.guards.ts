import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AppState } from '../../app.model';
import { getGameMap } from '../../models/selectors';

@Injectable()
export class CanActivateWorld implements CanActivate {
  constructor(private store: Store<AppState>, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // TODO: This check is hosed if a reasonable default value is set for the initial state for
    // map. Investigate whether this is sane.
    return this.store.select(getGameMap).pipe(
      take(1),
      map((mapName: string) => {
        // Verify that the map name is equal to the route id.
        // This is assuming that it will accomplish two things:
        // 1) If the user has no state, it will fail to activate (e.g. when refreshing the page)
        // 2) If the user is trying to navigate to a world that is not consistent with their app
        //    state, it will fail.
        if (mapName !== route.params['id']) {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      })
    );
  }
}
