/// <reference types="@mapeditor/tiled-api" />

/*
 * follow-portal.js
 *
 * This extension adds a 'Follow Warp' (Ctrl+F) action to the Map
 * menu, which jumps to the destination of a selected Door / Portal feature object
 */

/* global tiled */

const followWarp = tiled.registerAction('FollowPortal', function (/* action */) {
  /** @type TileMap */
  const map = tiled.activeAsset;
  if (!map.isTileMap) {
    return;
  }

  const selectedObject = map.selectedObjects[0];
  if (!selectedObject) {
    return;
  }

  const target = selectedObject.property('target');
  const targetX = parseInt(selectedObject.property('targetX'), 10) * 16;
  const targetY = parseInt(selectedObject.property('targetY'), 10) * 16;
  if (!target) {
    return;
  }

  /** @type TileMap */
  const destinationMap = tiled.open(target);
  if (!destinationMap) {
    return;
  }

  tiled.mapEditor.currentMapView.centerOn(targetX, targetY);
});
followWarp.text = 'Follow Portal';
followWarp.shortcut = 'Ctrl+F';

tiled.extendMenu('Map', [{ separator: true }, { action: 'FollowPortal' }]);
