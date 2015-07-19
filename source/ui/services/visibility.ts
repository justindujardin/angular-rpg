export class Visibility {
  /**
   * Is the visibility API supported?
   */
  public supported:boolean = document.hasOwnProperty('hidden');

  private _changeVisibility:any = () => this.onChange();

  constructor() {
    if (this.supported) {
      document.addEventListener('visibilityChange', this._changeVisibility);
    }
  }
  destroy() {
    if(this.supported){
      document.removeEventListener('visibilityChange', this._changeVisibility);
    }
  }

  onChange() {
    switch(document.visibilityState){
      case 'visible':
        break;
      case 'hidden':
        break;
      case 'prerender':
        break;
      case 'unloaded':
        break;

    }
  }
}
