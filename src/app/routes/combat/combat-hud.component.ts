import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { List } from 'immutable';
import { Observable } from 'rxjs';
import { ResourceManager } from '../../../app/core/resource-manager';
import { AppState } from '../../app.model';
import { LoadingService } from '../../components/loading/loading.service';
import { IPartyMember } from '../../models/base-entity';
import { getCombatEncounterParty } from '../../models/selectors';
import { GameEntityObject } from '../../scene/game-entity-object';
import { Scene } from '../../scene/scene';

@Component({
  selector: 'combat-hud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./combat-hud.component.scss'],
  templateUrl: './combat-hud.component.html',
})
export class CombatHUDComponent {
  @Input() scene: Scene;

  party$: Observable<List<IPartyMember>> = this.store.select(getCombatEncounterParty);

  constructor(
    public store: Store<AppState>,
    public loadingService: LoadingService,
    public loader: ResourceManager
  ) {}

  getMemberClass(member: GameEntityObject, focused?: GameEntityObject): any {
    return {
      focused:
        focused &&
        focused.model &&
        member &&
        member.model &&
        member.model.name === focused.model.name,
    };
  }
}
