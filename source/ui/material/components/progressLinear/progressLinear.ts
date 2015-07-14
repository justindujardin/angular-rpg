import '../../include';
import {Component,View,ElementRef} from 'angular2/angular2';

/**
 * @ngdoc directive
 * @name mdProgressLinear
 * @module material.components.progressLinear
 * @restrict E
 *
 * @description
 * The linear progress directive is used to make loading content in your app as delightful and painless as possible by minimizing the amount of visual change a user sees before they can view and interact with content. Each operation should only be represented by one activity indicator—for example, one refresh operation should not display both a refresh bar and an activity circle.
 *
 * For operations where the percentage of the operation completed can be determined, use a determinate indicator. They give users a quick sense of how long an operation will take.
 *
 * For operations where the user is asked to wait a moment while something finishes up, and it’s not necessary to expose what's happening behind the scenes and how long it will take, use an indeterminate indicator.
 *
 * @param {string} md-mode Select from one of four modes: determinate, indeterminate, buffer or query.
 * @param {number=} value In determinate and buffer modes, this number represents the percentage of the primary progress bar. Default: 0
 * @param {number=} md-buffer-value In the buffer mode, this number represents the percentage of the secondary progress bar. Default: 0
 *
 * @usage
 * <hljs lang="html">
 * <md-progress-linear md-mode="determinate" value="..."></md-progress-linear>
 *
 * <md-progress-linear md-mode="determinate" ng-value="..."></md-progress-linear>
 *
 * <md-progress-linear md-mode="indeterminate"></md-progress-linear>
 *
 * <md-progress-linear md-mode="buffer" value="..." md-buffer-value="..."></md-progress-linear>
 *
 * <md-progress-linear md-mode="query"></md-progress-linear>
 * </hljs>
 */
@Component({
  selector: 'md-progress-linear',
  properties: ['mdMode', 'mdBufferValue', 'value'],
  host: {
    'role': 'progressbar',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    '[attr.aria-valuenow]': 'value'
  }
})
@View({
  template: `
    <div class="md-container">
      <div class="md-dashed"></div>
      <div class="md-bar md-bar1"></div>
      <div class="md-bar md-bar2"></div>
    </div>
   `
})
export class MdProgressLinear {
  mdMode:string = 'determinate';

  constructor(el:ElementRef) {
    this._barOneStyle = el.nativeElement.querySelector('.md-bar1').style;
    this._barTwoStyle = el.nativeElement.querySelector('.md-bar2').style;
    var container:HTMLElement = el.nativeElement.querySelector('.md-container');
    this.mdBufferValue = this.value = 0;
    container.classList.add('md-ready');
  }

  private _value:number;
  set value(val:number) {
    this._value = clamp(val);
    if (this.mdMode == 'query') {
      return;
    }
    this._barOneStyle['transform'] = this._barOneStyle['-webkit-transform'] = transforms[this._value];
  }

  get value():number {
    return this._value;
  }

  private _mdBufferValue:number;
  set mdBufferValue(val:number) {
    this._mdBufferValue = clamp(val);
    this._barTwoStyle['transform'] = this._barTwoStyle['-webkit-transform'] = transforms[this._mdBufferValue];
  }

  get mdBufferValue():number {
    return this._mdBufferValue;
  }

  private _barOneStyle:any;
  private _barTwoStyle:any;
}

function clamp(value:number) {
  if (value > 100) {
    return 100;
  }

  if (value < 0) {
    return 0;
  }

  return Math.ceil(value || 0);
}

// **********************************************************
// Private Methods
// **********************************************************
var transforms = (function () {
  var values = new Array(101);
  for (var i = 0; i < 101; i++) {
    values[i] = makeTransform(i);
  }

  return values;

  function makeTransform(value:number) {
    var scale = value / 100;
    var translateX = (value - 100) / 2;
    return 'translateX(' + translateX.toString() + '%) scale(' + scale.toString() + ', 1)';
  }
})();
