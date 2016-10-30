import {RouterStateSnapshot, ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../../app.model';
import {CombatCurrentType, CombatEncounter} from '../../models/combat/combat.model';
import {getEncounter} from '../../models/combat/combat.reducer';

@Injectable()
export class CanActivateCombat implements CanActivate {
  constructor(private store: Store<AppState>, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return getEncounter(this.store).take(1).map((encounter: CombatCurrentType) => {
      if (!encounter) {
        this.router.navigate(['/']);
        return false;
      }
      return (encounter as CombatEncounter).id === route.params['id'];
    });
  }
}
