import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../../app.model';
import {sliceCombatState} from '../../models/selectors';
import {CombatState} from '../../models/combat/combat.model';

@Injectable()
export class CanActivateCombat implements CanActivate {
  constructor(private store: Store<AppState>, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select(sliceCombatState).take(1).map((combatState: CombatState) => {
      if (!combatState || combatState.type === 'none') {
        this.router.navigate(['/']);
        return false;
      }
      return combatState.id === route.params['id'];
    });
  }
}
