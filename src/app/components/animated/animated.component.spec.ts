import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_IMPORTS } from '../../app.imports';
import { Point } from '../../core';
import { Scene } from '../../scene/scene';
import { GameWorld } from '../../services/game-world';
import { RPGGame } from '../../services/rpg-game';
import { AnimatedComponent, IAnimationConfig } from './animated.component';

function getFixture() {
  const fixture = TestBed.createComponent(AnimatedComponent);
  const comp: AnimatedComponent = fixture.componentInstance;
  fixture.detectChanges();
  return { fixture, comp };
}

describe('AnimatedComponent', () => {
  let world: GameWorld;
  let scene: Scene;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...APP_IMPORTS],
      declarations: [AnimatedComponent],
    }).compileComponents();
    world = TestBed.inject(GameWorld);
    scene = new Scene();
    world.mark(scene);
    world.time.start();
    const game = TestBed.inject(RPGGame);
    await game.initGame(false);
  });
  afterEach(async () => {
    world.erase(scene);
    world.time.stop();
    scene.destroy();
  });

  it('initializes', async () => {
    const { fixture, comp } = getFixture();
    await fixture.whenRenderingDone();
    expect(() => {
      comp.update(0);
    }).not.toThrow();
  });

  it('plays async animations', async () => {
    const { fixture, comp } = getFixture();
    await fixture.whenRenderingDone();
    scene.addObject(comp);

    let cb1 = false;
    let cb2 = false;
    const anim: IAnimationConfig[] = [
      {
        name: 'Prep Animation',
        host: comp,
        duration: 0,
        callback: async () => {
          cb1 = true;
          return true;
        },
      },
      {
        name: 'Move Forward for Attack',
        host: comp,
        repeats: 0,
        duration: 10,
        move: new Point(1, 0),
        frames: [1, 2],
        callback: async () => {
          cb2 = true;
          return true;
        },
      },
    ];

    await comp.playChain(anim);
    expect(cb1).toBe(true);
    expect(cb2).toBe(true);
  });
});
