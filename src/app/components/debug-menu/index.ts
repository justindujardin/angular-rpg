import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { DebugMenuComponent } from './debug-menu.component';
export const RPG_DEBUG_MENU_EXPORTS = [DebugMenuComponent];
export const RPG_DEBUG_MENU_IMPORTS = [MatTableModule, MatSortModule, MatTabsModule];
