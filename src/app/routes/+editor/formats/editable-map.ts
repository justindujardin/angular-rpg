import {Events} from '../../../../game/pow-core/events';
import {
  EditableMapTileData, EditableMapTileLayer, EditableMapTileSet,
  EditableTileMapData
} from '../interfaces/editable-map';
import {Point} from '../../../../game/pow-core/point';
import {errors} from '../../../../game/pow-core/errors';
export class EditableTileLayer extends Events implements EditableMapTileLayer {
  static TYPES: any = {
    LAYER: "layer",
    OBJECTGROUP: "objectgroup"
  };
  static EVENTS: any = {
    CHANGE_TILE: 'change:tile',
    CHANGE_VISIBLE: 'change:visible',
    CHANGE_NAME: 'change:name'
  };
  // EditableMapTileLayer
  point: Point;
  size: Point;
  tiles: number[];
  properties: {
    [name: string]: any
  };
  visible: boolean;
  opacity: number;
  objects: any[];
  name: string;
  // end EditableMapTileLayer
  constructor(public type: string) {
    super();
    switch (type) {
      case EditableTileLayer.TYPES.LAYER:
        this.tiles = [];
        break;
      case EditableTileLayer.TYPES.OBJECTGROUP:
        this.objects = [];
        break;
      default:
        throw new Error(errors.INVALID_ARGUMENTS);
    }
  }

  setName(name: string) {
    this.name = name;
    this.trigger(EditableTileLayer.EVENTS.CHANGE_NAME, name);
  }

  setSize(size: Point) {
    if (!size || size.isZero()) {
      throw new Error(errors.INVALID_ARGUMENTS);
    }
    this.size = size;
    this.tiles = <number[]>Array.apply(null, new Array(size.x * size.y)).map(Number.prototype.valueOf, 0);
  }

  setTileGid(index: number, gid: number) {
    if (index < 0 || index > this.tiles.length || gid < 0) {
      throw new Error(errors.INVALID_ARGUMENTS);
    }
    this.tiles[index] = gid;
    this.trigger(EditableTileLayer.EVENTS.CHANGE_TILE, index);
  }

  toggleVisible() {
    this.visible = !this.visible;
    this.trigger(EditableTileLayer.EVENTS.CHANGE_VISIBLE, this.visible);
  }
}

export class EditableTileMap extends Events implements EditableTileMapData {
  tileInfo: EditableMapTileData[] = [];
  tileSets: EditableMapTileSet[] = [];
  layers: EditableTileLayer[] = [];
  point: Point = new Point(0, 0);
  size: Point = new Point(1, 1);
  tileSize: Point = new Point(16, 16);
  name: string = "Untitled";
  // TODO: Replace with observable outputs?
  static EVENTS: any = {
    ADD_LAYER: 'layer:add',
    REMOVE_LAYER: 'layer:remove'
  };

  setName(location: string) {
    this.name = location;
  }

  setSize(size: Point) {
    this.size = size.clone();
  }

  setPoint(at: Point) {
    this.point = at.clone();
  }

  setTileSize(size: Point) {
    this.tileSize = size.clone();
  }

  getLayer(index: number): EditableTileLayer {
    if (index < 0 || index > this.layers.length) {
      throw new Error(errors.INDEX_OUT_OF_RANGE);
    }
    return <EditableTileLayer>this.layers[index];
  }

  addLayer(layer: EditableTileLayer) {
    this.insertLayer(this.layers.length, layer);
  }

  insertLayer(index: number, layer: EditableTileLayer) {
    if (!layer || !layer.size) {
      throw new Error(errors.INVALID_ARGUMENTS);
    }
    this.layers.splice(index, 0, layer);
    this.trigger(EditableTileMap.EVENTS.ADD_LAYER, layer, index);
  }

  removeLayer(index: number) {
    if (index < 0 || index > this.layers.length) {
      throw new Error(errors.INDEX_OUT_OF_RANGE);
    }
    var layer: EditableTileLayer = this.layers[index];
    this.layers.splice(index, 1);
    this.trigger(EditableTileMap.EVENTS.REMOVE_LAYER, layer, index);

  }
}
