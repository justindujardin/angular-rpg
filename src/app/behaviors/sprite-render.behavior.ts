import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ImageResource } from '../../app/core/resources/image.resource';
import { ISpriteMeta } from '../core/api';
import { GameWorld } from '../services/game-world';
import { SceneObjectBehavior } from './scene-object-behavior';

@Component({
  selector: 'sprite-render-behavior',
  template: ` <ng-content></ng-content>`,
})
export class SpriteRenderBehaviorComponent
  extends SceneObjectBehavior
  implements AfterViewInit, OnDestroy
{
  constructor(public gameWorld: GameWorld) {
    super();
  }

  private _icon$: BehaviorSubject<string | null> = new BehaviorSubject(null);
  icon$: Observable<string | null> = this._icon$;

  @Input() set icon(value: string | null) {
    this._icon$.next(value);
  }

  get icon(): string | null {
    return this._icon$.value;
  }

  private _subscription: Subscription | null = null;

  meta: ISpriteMeta | null = null;
  image: HTMLImageElement | null = null;

  ngAfterViewInit(): void {
    this._subscription = this.icon$
      .pipe(
        distinctUntilChanged(),
        map((name: string) => {
          if (!name) {
            this.meta = null;
            this.image = null;
            return;
          }
          this.meta = this.gameWorld.sprites.getSpriteMeta(name);
          if (this.meta) {
            this.gameWorld.sprites
              .getSpriteSheet(this.meta.source)
              .then((images: ImageResource[]) => {
                this.image = images[0].data;
              });
          }
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._subscription?.unsubscribe();
  }
}
