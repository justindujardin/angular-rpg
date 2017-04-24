import {NgModule, ApplicationRef} from '@angular/core';
import {removeNgStyles, createNewHosts, createInputTransfer} from '@angularclass/hmr';
import {ENV_PROVIDERS} from './environment';
import {AppComponent} from './app.component';
import {APP_PROVIDERS} from './app.providers';
import {APP_IMPORTS} from './app.imports';
import {APP_DECLARATIONS} from './app.declarations';
import {Store} from '@ngrx/store';
import {AppState} from './app.model';

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [AppComponent],
  declarations: APP_DECLARATIONS,
  imports: APP_IMPORTS,
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})
export class AppModule {
  constructor(public appRef: ApplicationRef,
              private _store: Store<AppState>) {
  }

  hmrOnInit(store) {
    if (!store || !store.rootState) {
      return;
    }

    // restore state by dispatch a SET_ROOT_STATE action
    if (store.rootState) {
      this._store.dispatch({
        type: 'SET_ROOT_STATE',
        payload: store.rootState
      });
    }

    if ('restoreInputValues' in store) {
      store.restoreInputValues();
    }
    this.appRef.tick();
    Object.keys(store).forEach((prop) => delete store[prop]);
  }

  hmrOnDestroy(store) {
    const cmpLocation = this.appRef.components.map((cmp) => cmp.location.nativeElement);
    this._store.take(1).subscribe((s) => store.rootState = s);
    store.disposeOldHosts = createNewHosts(cmpLocation);
    store.restoreInputValues = createInputTransfer();
    removeNgStyles();
  }

  hmrAfterDestroy(store) {
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }

}
