// Common to everything ---
import {Point} from '../../../../game/pow-core/point';
export interface EditableMapBounds {
  point: Point;
  size: Point;
}
export interface EditableMapProperties {
  properties?: {
    [key: string]: any
  };
}

export interface EditableMapNamed extends EditableMapProperties {
  name: string;
}

// Tile elements ---
export interface EditableMapTileData extends EditableMapProperties {
  url: string;
  image: HTMLImageElement;
  imageSize: Point;
  imagePoint?: Point;
  visible?: boolean;
  opacity?: number; // 0-1
}

export interface EditableMapTileSet extends EditableMapNamed, EditableMapTileData {
  tileSize: Point;
  tiles: EditableMapTileData[];
  firstIndex: number;
}

// Layers ---
export interface EditableMapTileLayer extends EditableMapNamed, EditableMapBounds {
  tiles: number[]; // y * w + x = tile index from col/row
  properties: {
    [name: string]: any
  };
  visible: boolean;
  opacity: number;
  objects: any[];
}

// Tile Map ---
export interface EditableTileMapData extends EditableMapNamed, EditableMapBounds {
  // Array of tile meta information sorted by global tileset ID
  tileInfo: EditableMapTileData[];
  tileSets: EditableMapTileSet[];
  tileSize: Point;
  layers: EditableMapTileLayer[];
}

