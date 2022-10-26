import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
  StoreFeatureComponent,
  StoreInventoryCategories,
} from '../store-feature.component';

@Component({
  selector: 'items-store-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../store-feature.component.scss'],
  templateUrl: '../store-feature.component.html',
})
export class ItemsStoreFeatureComponent extends StoreFeatureComponent {
  category: StoreInventoryCategories = 'misc';
}
