import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
  StoreFeatureComponent,
  StoreInventoryCategories,
} from '../store-feature.component';

@Component({
  selector: 'weapons-store-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../store-feature.component.scss'],
  templateUrl: '../store-feature.component.html',
})
export class WeaponsStoreFeatureComponent extends StoreFeatureComponent {
  category: StoreInventoryCategories = 'weapons';
}
