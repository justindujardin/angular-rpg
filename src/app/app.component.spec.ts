import {inject, TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {StoreModule} from '@ngrx/store';
import {ModelsModule, rootReducer} from './models';
import {ServicesModule} from './services/index';

describe('AppComponent', () => {
  beforeEach(() => {
    return TestBed.configureTestingModule({
      providers: [AppComponent],
      imports: [
        StoreModule.provideStore(rootReducer),
        ServicesModule.forRoot(),
        ModelsModule.forRoot()
      ]
    });
  });

  it('should have an @ngrx/store injectable', inject([AppComponent], (app: AppComponent) => {
    expect(app.store).toBeDefined();
  }));

});
