import {Component, AfterViewInit} from '@angular/core';
import {Map} from '../map';

@Component({
  selector: 'tile-map',
  templateUrl: './tile-map.component.html',
  host: {
    '(window:resize)': '_onResize($event)',
    '(click)': '_onClick($event)',
    '[style.color]': 'styleBackground'
  }
})
export class TileMapComponent extends Map {
}
