// -------------------------------------------------------------------------
// Implement a subset of the Tiled editor format:
//
// https://github.com/bjorn/tiled/wiki/TMX-Map-Format

export interface ITiledBase {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  _xml: any;
}

// <layer>, <objectgroup>
export interface ITiledLayerBase extends ITiledBase {
  opacity: number; // 0-1
  properties?: any;
}
export interface ITiledLayer extends ITiledLayerBase {
  data?: any;
  color?: string;
  objects?: ITiledObject[];
}

// <object>
export interface ITiledObject extends ITiledBase {
  properties?: any;
  rotation?: number;
  type?: string;
  gid?: number;
  color?: string;
}

export interface ITileSetDependency {
  source?: string; // Path to URL source from which to load data.
  data?: any; // Data instead of source.
  firstgid: number; // First global id.
  literal?: string; // The literal string representing the source as originally specified in xml
}
