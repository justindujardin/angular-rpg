/// <reference types="@mapeditor/tiled-api" />

/*
 * This extension adds a 'Convert Objects to Tiles' (Ctrl+U) action to the Map
 * menu, which converts all the angular-rpg custom objects in open maps to Tile
 * objects that support rendering the desired sprite in editor.
 */

const action = tiled.registerAction('ConvertObjectsToTiles', function (/* action */) {
  const map = tiled.activeAsset as TileMap | null;
  if (!map?.isTileMap) {
    tiled.alert('No map is open');
    return;
  }

  const features = map.layers.find((layer: Layer) => {
    if (layer.name === 'Features') {
      return true;
    }
    return false;
  });
  if (!features) {
    tiled.alert('Features layer is not present');
  }

  if (!features.isObjectLayer) {
    tiled.alert('Features layer is not an Object layer');
  }

  tiled.alert('Features layer is: ' + features.name);
});
action.text = 'Convert Objects to Tiles';
action.shortcut = 'Ctrl+U';

tiled.extendMenu('Map', [{ separator: true }, { action: 'ConvertObjectsToTiles' }]);
