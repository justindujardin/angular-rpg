import {inject, TestBed} from '@angular/core/testing';
import {App} from './app.component';
import {StoreModule} from '@ngrx/store';
import {rootReducer} from './models';


describe('App', () => {
  beforeEach(() => {
    return TestBed.configureTestingModule({
      providers: [App],
      imports: [StoreModule.provideStore(rootReducer)]
    });
  });

  it('should have an @ngrx/store injectable', inject([App], (app: App) => {
    expect(app.store).toBeDefined();
  }));

});
