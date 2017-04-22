import {RouterStateSnapshot, ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../../app.model';
import {CombatCurrentType, CombatEncounter} from '../../models/combat/combat.model';
import {getCombatEncounter} from '../../models/selectors';

@Injectable()
export class CanActivateCombat implements CanActivate {
  constructor(private store: Store<AppState>, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select(getCombatEncounter).take(1).map((encounter: CombatCurrentType) => {
      if (!encounter) {
        this.router.navigate(['/']);
        return false;
      }
      return (encounter as CombatEncounter).id === route.params['id'];
    });
  }
}
