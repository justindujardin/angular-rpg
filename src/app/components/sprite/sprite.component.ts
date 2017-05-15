import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {SpriteRender} from '../../services/sprite-render';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'rpg-sprite',
  styleUrls: ['./sprite.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<img [style.width]="width$ | async" [style.height]="height$ | async" [src]="dataUrl$ | async">`
})
export class RPGSpriteComponent {

  static INVALID_IMAGE: string = 'assets/images/a/blank.gif';

  private _dataUrl$ = new ReplaySubject<SafeResourceUrl>(1);
  dataUrl$: Observable<SafeResourceUrl> = this._dataUrl$;
  private _width$ = new BehaviorSubject<string>('64');
  width$: Observable<string> = this._width$;
  private _height$ = new BehaviorSubject<string>('64');
  height$: Observable<string> = this._height$;
  private _name$ = new BehaviorSubject<string>(RPGSpriteComponent.INVALID_IMAGE);
  name$: Observable<string> = this._name$;
  private _frame$ = new BehaviorSubject<number>(0);
  frame$: Observable<number> = this._frame$;

  @Input()
  set width(value: string) {
    this._width$.next(value);
  }

  @Input()
  set height(value: string) {
    this._height$.next(value);
  }

  @Input()
  set frame(value: number) {
    if (this._frame$.value !== value) {
      this._frame$.next(value);
      this._get(this._name$.value);
    }
  }

  @Input()
  set name(value: string) {
    if (!value) {
      this._name$.next(RPGSpriteComponent.INVALID_IMAGE);
      return;
    }
    this._name$.next(value);
    this._get(value);
  }

  styleBackground: string = 'rgba(0,0,0,1)';
  /**
   * Use a singleton canvas for rendering all sprites
   */
  private static _renderCanvas: HTMLCanvasElement;
  private _canvasAcquired: boolean = false;

  constructor(private sanitizer: DomSanitizer,
              private renderer: SpriteRender) {
    if (!RPGSpriteComponent._renderCanvas) {
      RPGSpriteComponent._renderCanvas = document.createElement('canvas') as HTMLCanvasElement;
      RPGSpriteComponent._renderCanvas.width = RPGSpriteComponent._renderCanvas.height = 64;
      RPGSpriteComponent._renderCanvas.style.position = 'absolute';
      RPGSpriteComponent._renderCanvas.style.left = RPGSpriteComponent._renderCanvas.style.top = '-9000px';
    }
  }

  /**
   * Returns a canvas rendering context that may be drawn to.  A corresponding
   * call to releaseRenderContext will return the drawn content of the context.
   */
  getRenderContext(width: number, height: number): CanvasRenderingContext2D {
    if (this._canvasAcquired) {
      throw new Error('Only one rendering canvas is available at a time.' +
        ' Check for calls to this function without corresponding releaseCanvas() calls.');
    }
    this._canvasAcquired = true;
    RPGSpriteComponent._renderCanvas.width = width;
    RPGSpriteComponent._renderCanvas.height = height;
    const context: any = RPGSpriteComponent._renderCanvas.getContext('2d');
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    (<any> context).imageSmoothingEnabled = false;
    return context;
  }

  /**
   * Call this after getRenderContext to finish rendering and have the source
   * of the canvas content returned as a data url string.
   */
  releaseRenderContext(): string {
    this._canvasAcquired = false;
    return RPGSpriteComponent._renderCanvas.toDataURL();
  }

  private _get(src: string) {
    if (!src || src === RPGSpriteComponent.INVALID_IMAGE) {
      this._dataUrl$.next(RPGSpriteComponent.INVALID_IMAGE);
      return;
    }
    this.renderer.getSingleSprite(src, this._frame$.value).then((sprite: HTMLImageElement) => {
      // Get the context for drawing
      const width: number = parseInt(this._width$.value, 10);
      const height: number = parseInt(this._height$.value, 10);

      const renderContext: any = this.getRenderContext(width, height);
      renderContext.clearRect(0, 0, width, height);
      renderContext.drawImage(sprite, 0, 0, width, height);
      const imageDataUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.releaseRenderContext());
      this._dataUrl$.next(imageDataUrl);
    });

  }
}
