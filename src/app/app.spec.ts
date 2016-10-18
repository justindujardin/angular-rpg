import {inject, TestBed} from '@angular/core/testing';
// Load the implementations that should be tested
import {App} from './app.component';


describe('App', () => {
  // provide our implementations or mocks to the dependency injector
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      App
    ]}));

  it('should have an @ngrx/store injectable', inject([ App ], (app: App) => {
    expect(app.store).toBeDefined();
  }));

});
