/// <reference types="@mapeditor/tiled-api" />

/*
 * follow-portal.js
 *
 * This extension adds a 'Follow Warp' (Ctrl+F) action to the Map
 * menu, which can be used to jump to the destination of a selected warp object
 * (as used on maps made for Source of Tales - http://sourceoftales.org/).
 *
 * Warps are common in games and there are of course many ways to implement
 * them, so this script is unlikely to work in your particular project. But
 * with some adjustments it probably could!
 */

/* global tiled */

const followWarp = tiled.registerAction("FollowPortal", function (/* action */) {
  /** @type TileMap */
  const map = tiled.activeAsset;
  if (!map.isTileMap) {
    tiled.alert("Not a tile map!");
    return;
  }

  const selectedObject = map.selectedObjects[0];
  if (!selectedObject) {
    tiled.alert("No object selected!");
    return;
  }

  const target = selectedObject.property("target");
  const targetX = parseInt(selectedObject.property("targetX"), 10) * 16;
  const targetY = parseInt(selectedObject.property("targetY"), 10) * 16;
  if (!target) {
    return;
  }

  const mapsPath = map.fileName.substr(0, map.fileName.indexOf("maps/") + 5);
  const destinationMapFile = mapsPath + target + ".tmx";

  /** @type TileMap */
  const destinationMap = tiled.open(destinationMapFile);
  if (!destinationMap) {
    return;
  }

  tiled.mapEditor.currentMapView.centerOn(targetX, targetY);
});
followWarp.text = "Follow Portal";
followWarp.shortcut = "Ctrl+F";

tiled.extendMenu("Map", [{ separator: true }, { action: "FollowPortal" }]);
