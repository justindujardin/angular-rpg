import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
  StoreFeatureComponent,
  StoreInventoryCategories,
} from '../store-feature.component';

@Component({
  selector: 'armors-store-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../store-feature.component.scss'],
  templateUrl: '../store-feature.component.html',
})
export class ArmorsStoreFeatureComponent extends StoreFeatureComponent {
  category: StoreInventoryCategories = 'armor';
}
