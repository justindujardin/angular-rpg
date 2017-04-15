import {Resolve, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import 'rxjs/add/observable/of';
import {LoadingService} from '../../components/loading/loading.service';
import {GameWorld} from '../../services/game-world';

@Injectable()
export class GameResolver implements Resolve<any> {

  constructor(private world: GameWorld, private loadingService: LoadingService) {

  }

  /** Resolve when the world ready$ observable emits */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return new Promise((resolve) => {
      this.loadingService.loading = true;
      this.loadingService.title = 'RPG!';
      this.loadingService.message = 'Initializing the world...';
      const sub = this.world.ready$.subscribe(() => {
        if (sub) {
          sub.unsubscribe();
        }
        resolve();
      });
    });

  }
}
