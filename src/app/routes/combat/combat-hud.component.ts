import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Scene} from '../../../game/pow2/scene/scene';
import {Observable} from 'rxjs/Observable';
import {getCombatEncounterParty} from '../../models/selectors';
import {Store} from '@ngrx/store';
import {AppState} from '../../app.model';
import {LoadingService} from '../../components/loading/loading.service';
import {ResourceManager} from '../../../game/pow-core/resource-manager';
import {Entity} from '../../models/entity/entity.model';
import {GameEntityObject} from '../../scene/game-entity-object';
import {List} from 'immutable';

@Component({
  selector: 'combat-hud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./combat-hud.component.scss'],
  templateUrl: './combat-hud.component.html'
})
export class CombatHUDComponent {

  @Input() scene: Scene;

  /** Observable<Entity[]> of player-card members */
  party$: Observable<List<Entity>> = this.store.select(getCombatEncounterParty);

  constructor(public store: Store<AppState>,
              public loadingService: LoadingService,
              public loader: ResourceManager) {
  }

  getMemberClass(member: GameEntityObject, focused?: GameEntityObject): any {
    return {
      focused: focused && focused.model && member && member.model && member.model.name === focused.model.name
    };
  }

}
