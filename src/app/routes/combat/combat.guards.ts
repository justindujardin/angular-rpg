import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { AppState } from '../../app.model';
import { CombatState } from '../../models/combat/combat.model';
import { sliceCombatState } from '../../models/selectors';

@Injectable()
export class CanActivateCombat {
  constructor(
    private store: Store<AppState>,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select(sliceCombatState).pipe(
      take(1),
      map((combatState: CombatState) => {
        if (!combatState || combatState.type === 'none') {
          this.router.navigate(['/']);
          return false;
        }
        return combatState.id === route.params['id'];
      }),
    );
  }
}
