import {inject, TestBed} from '@angular/core/testing';
import {StoreModule} from '@ngrx/store';
import {EditorComponent} from './editor.component';
import {ModelsModule, rootReducer} from '../../models/index';
import {ServicesModule} from '../../services/index';
import {EditorModule} from './index';

describe('EditorComponent', () => {
  beforeEach(() => {
    return TestBed.configureTestingModule({
      providers: [EditorComponent],
      imports: [
        StoreModule.provideStore(rootReducer),
        EditorModule,
        ServicesModule.forRoot(),
        ModelsModule.forRoot()
      ]
    });
  });

  it('should have an @ngrx/store injectable', inject([EditorComponent], (editor: EditorComponent) => {
    expect(editor.store).toBeDefined();
  }));

});
