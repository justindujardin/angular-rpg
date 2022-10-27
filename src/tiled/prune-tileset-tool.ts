/// <reference types="@mapeditor/tiled-api" />

interface IPruneTilesetTool extends Tool {
  isActive: boolean;
  getMaps(): string[];
  getTilesetPaths(): string[];
  analyzeMaps: () => void;
  analyzeMap: (map: TileMap) => any;
  convertMap: (map: TileMap) => any;
  findTileForIcon: (map: TileMap, icon: string) => Tile | null;
  getAllTilesets: () => Tileset[];
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
        // this.analyzeMaps();
        this.convertMap(tiled.activeAsset as TileMap);
      }
    }
  },

  getAllTilesets: function (): Tileset[] {
    return tiled.openAssets.filter((asset) => asset.isTileset) as Tileset[];
  },
  findTileForIcon: function (map: TileMap, icon: string): Tile | null {
    const allTilesets: Tileset[] = this.getAllTilesets();
    for (let i = 0; i < allTilesets.length; i++) {
      const tileSet: Tileset = allTilesets[i];
      for (let j = 0; j < tileSet.tiles.length; j++) {
        const tile: Tile = tileSet.tiles[j];
        if (!tile) {
          continue;
        }
        const tilePath = tile.imageFileName;
        // tiled.log(tile.imageFileName);
        const tileIcon = tilePath.substring(tilePath.lastIndexOf('/') + 1);
        if (tileIcon === icon) {
          tiled.log(
            `-- found gid ${tile.id} for icon ${icon} in tileset ${tileSet.name}`
          );
          return tile;
        }
      }
    }
    return null;
  },
  /** Convert a map from Rect features to Tile features */
  convertMap: function (map: TileMap) {
    const activeMap = tiled.activeAsset as TileMap;
    this.getTilesetPaths().forEach((filePath: string) => {
      tiled.open(filePath);
    });
    tiled.open(activeMap.fileName);

    for (let i = 0; i < map.layerCount; i++) {
      let layer = map.layerAt(i) as ObjectGroup;
      if (!layer.isObjectLayer) {
        continue;
      }

      for (let obj = 0; obj < layer.objectCount; ++obj) {
        const feature: MapObject = layer.objectAt(obj);
        if (!feature.tile) {
          const targetIcon = `${feature.properties().icon}`;
          if (!targetIcon) {
            continue;
          }
          // tiled.log(targetIcon);
          feature.tile = this.findTileForIcon(map, targetIcon);
          // this.findTileForIcon(map, targetIcon);
          // tiled.log(`Converting: ${feature.name}`);
        } else {
          // tiled.log(`Skipping: ${feature.name}`);
        }
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
  getTilesetPaths: function (): string[] {
    const mapsPath = tiled.activeAsset.fileName.substr(
      0,
      tiled.activeAsset.fileName.indexOf('maps/') + 5
    );
    const tileSetsPath = `${mapsPath}tiles/`;
    const files: string[] = File.directoryEntries(tileSetsPath);
    return files
      .filter((val) => val.endsWith('.tsx'))
      .map((filename) => tileSetsPath + filename);
  },
} as IPruneTilesetTool);
