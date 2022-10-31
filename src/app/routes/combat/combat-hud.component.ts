import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResourceManager } from '../../../app/core/resource-manager';
import { AppState } from '../../app.model';
import { LoadingService } from '../../components/loading/loading.service';
import { CombatantTypes } from '../../models/base-entity';
import { getCombatEncounterParty } from '../../models/selectors';
import { Scene } from '../../scene/scene';
import { CombatStateMachineComponent } from './states';

@Component({
  selector: 'combat-hud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./combat-hud.component.scss'],
  templateUrl: './combat-hud.component.html',
})
export class CombatHUDComponent {
  @Input() scene: Scene;
  @Input() combat: CombatStateMachineComponent | null = null;

  party$: Observable<CombatantTypes[]> = this.store
    .select(getCombatEncounterParty)
    .pipe(map((f) => f.toJS()));

  constructor(
    public store: Store<AppState>,
    public loadingService: LoadingService,
    public loader: ResourceManager
  ) {}

  getMemberClass(
    member: CombatantTypes,
    focused?: CombatantTypes | null
  ): { [key: string]: boolean } {
    return {
      focused: !!(focused && member && member.name === focused.name),
    };
  }
}
