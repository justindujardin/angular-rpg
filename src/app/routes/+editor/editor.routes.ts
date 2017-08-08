import {EditorComponent} from './editor.component';
import {EditorGuards} from './editor.guards';
export const routes = [
  {
    path: '',
    component: EditorComponent,
    canActivate: [EditorGuards]
  },
  {path: ':id', component: EditorComponent}
];
