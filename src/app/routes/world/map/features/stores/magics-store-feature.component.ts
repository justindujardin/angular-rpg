import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
  StoreFeatureComponent,
  StoreInventoryCategories,
} from '../store-feature.component';

@Component({
  selector: 'magics-store-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../store-feature.component.scss'],
  templateUrl: '../store-feature.component.html',
})
export class MagicsStoreFeatureComponent extends StoreFeatureComponent {
  category: StoreInventoryCategories = 'magic';
}
