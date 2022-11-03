import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../../app.imports';
import { ITiledObject } from '../../../core/resources/tiled/tiled.model';
import { GameWorld } from '../../../services/game-world';
import { BlockFeatureComponent } from './block-feature.component';

const FEATURE: ITiledObject = {
  name: 'block feature',
  class: 'BlockFeatureComponent',
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  visible: true,
  properties: {
    passable: false,
  },
};

describe('BlockFeatureComponent', () => {
  const tileObject: any = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [BlockFeatureComponent],
    }).compileComponents();
    TestBed.inject(GameWorld);
  });

  it('refuses enter and does not set active', async () => {
    const fixture = TestBed.createComponent(BlockFeatureComponent);
    const comp: BlockFeatureComponent = fixture.componentInstance;
    comp.feature = FEATURE;
    fixture.detectChanges();

    // active = false to start
    expect(comp.active).toBe(false);

    // Cannot enter
    expect(comp.enter(tileObject)).toBe(false);

    // Active is not set
    expect(comp.active).toBe(false);
  });
});
