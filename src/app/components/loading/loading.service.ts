import {Observable, BehaviorSubject} from 'rxjs/Rx';

export class LoadingService {

  /* @internal */
  private _loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  /**
   * Observable that emits when the boolean value of loading changes.
   */
  public loading$: Observable<boolean> = this._loading$;

  /**
   * Set the loading state of the application
   * @param value
   */
  set loading(value: boolean) {
    this._loading$.next(value);
  }

  /* @internal */
  private _title$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public title$: Observable<string> = this._title$;

  set title(value: string) {
    this._title$.next(value);
  }

  /* @internal */
  private _message$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public message$: Observable<string> = this._message$;

  set message(value: string) {
    this._message$.next(value);
  }

}
