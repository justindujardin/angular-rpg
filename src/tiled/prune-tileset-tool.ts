/// <reference types="@mapeditor/tiled-api" />

interface IPruneTilesetTool extends Tool {
  isActive: boolean;
  getMaps(): string[];
  analyzeMaps: () => void;
  analyzeMap: (map: TileMap) => any;
}

var tool = tiled.registerTool('PruneTileset', {
  name: 'Prune Tileset',
  icon: 'prune-tileset-tool.png',
  isActive: false,
  usesSelectedTiles: true,
  activated: function () {
    this.isActive = true;
  },

  deactivated: function () {
    this.isActive = false;
  },

  mousePressed: function (button, x, y, modifiers) {
    const self: IPruneTilesetTool = this;
    if (this.isActive) {
      if (button == 1) {
        this.analyzeMap(tiled.activeAsset as TileMap);
      } else {
        this.analyzeMaps();
      }
    }
  },
  /** Analyze all maps in the map folder */
  analyzeMaps: function () {
    const self: IPruneTilesetTool = this;
    const activeMap = tiled.activeAsset as TileMap;
    const maps = self.getMaps();
    maps.forEach((filename: string) => {
      self.analyzeMap(tiled.open(filename) as TileMap);
    });
    // restore original map
    tiled.open(activeMap.fileName);
  },
  /** Analyze a single map */
  analyzeMap: function (map: TileMap) {
    const mapShort = map.fileName.substring(map.fileName.lastIndexOf('/') + 1);
    tiled.log(`============================ ${mapShort} ============================`);
    const allIds = {};
    const allImages = {};
    const allTilesets = {};

    for (let i = 0; i < map.layerCount; i++) {
      const layer = map.layerAt(i) as TileLayer;
      if (!layer.isTileLayer) {
        continue;
      }
      const foundIds = {};
      const region = layer.region();
      for (let x = region.boundingRect.x; x < region.boundingRect.width; x++) {
        for (let y = region.boundingRect.y; y < region.boundingRect.height; y++) {
          const tileAt: Tile = layer.tileAt(x, y);
          if (!tileAt) {
            continue;
          }
          allTilesets[tileAt.tileset.name] = true;
          foundIds[tileAt.id] = true;
          allIds[tileAt.id] = true;
          allImages[tileAt.imageFileName] = true;
        }
      }
    }
    const sorted = Object.keys(allIds)
      .map((f) => parseInt(f, 10))
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    tiled.log(`Tiles: [${sorted.join(', ')}]`);
    const images = Object.keys(allImages).map((image) =>
      image.substring(image.lastIndexOf('/') + 1)
    );
    tiled.log(`Images: [${images.join(', ')}]`);
    const tilesets = Object.keys(allTilesets).map((tileset) =>
      tileset.substring(tileset.lastIndexOf('/') + 1)
    );
    tiled.log(`Tilesets: [${tilesets.join(', ')}]`);
  },
  getMaps: function (): string[] {
    const mapsPath = tiled.activeAsset.fileName.substr(
      0,
      tiled.activeAsset.fileName.indexOf('maps/') + 5
    );
    const files: string[] = File.directoryEntries(mapsPath);
    return files
      .filter((val) => val.endsWith('.tmx'))
      .map((filename) => mapsPath + filename);
  },
} as IPruneTilesetTool);
