import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../app.imports';
import { CombatComponent } from './combat.component';

describe('CombatComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [CombatComponent],
    }).compileComponents();
  });

  it('should be instantiable', () => {
    const fixture = TestBed.createComponent(CombatComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
