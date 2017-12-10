import {EditableTileLayer, EditableTileMap} from './editable-map';
import {Point} from '../../../../game/pow-core/point';
import {IMapLoader} from '../interfaces/map-loader';
import {TiledTSXResource} from '../../../../game/pow-core/resources/tiled/tiled-tsx.resource';
import {TiledTMXResource} from '../../../../game/pow-core/resources/tiled/tiled-tmx.resource';
import {ITiledLayer} from '../../../../game/pow-core/resources/tiled/tiled.model';
import {ResourceManager} from '../../../../game/pow-core/resource-manager';
import * as _ from 'underscore';
import {Injectable} from '@angular/core';

/** Used to beautify XML map outputs */
declare var vkbeautify: any;

export function PowLayerToTiledLayer(layer: EditableTileLayer): ITiledLayer {
  let result: ITiledLayer = {
    opacity: layer.opacity,
    name: layer.name,
    x: layer.point.x,
    y: layer.point.y,
    width: layer.size.x,
    height: layer.size.y,
    visible: layer.visible,
    _xml: null
  };
  switch (layer.type) {
    case EditableTileLayer.TYPES.LAYER:
      result.data = layer.tiles;
      break;
    case EditableTileLayer.TYPES.OBJECTGROUP:
      result.objects = layer.objects;
      break;
    default:
      console.warn(`PowLayerToTiledLayer: unknown layer type -> ${layer.type}`);
      break;
  }
  return result;
}

export function TiledLayerToPowLayer(layer: ITiledLayer): EditableTileLayer {
  // TODO: more robust type detection?  What about if tiles is undefined, and layers is also undefined?
  let type: string = typeof layer.data !== 'undefined'
    ? EditableTileLayer.TYPES.LAYER
    : EditableTileLayer.TYPES.OBJECTGROUP;
  let powLayer: EditableTileLayer = new EditableTileLayer(type);
  _.extend(powLayer, {
    tiles: layer.data,
    objects: layer.objects,
    properties: {},
    size: new Point(layer.width, layer.height),
    name: layer.name,
    point: new Point(layer.x, layer.y),
    visible: layer.visible,
    opacity: layer.opacity
  });
  return powLayer;
}

@Injectable()
export class TiledMapLoader implements IMapLoader {

  constructor(private loader: ResourceManager) {
  }

  load(location: string): Promise<EditableTileMap> {
    return this.loader.load(location).then((tiledResources: TiledTMXResource[]) => {
      const tiledResource = tiledResources[0];
      const result: EditableTileMap = new EditableTileMap();
      result.setName(location);
      result.setSize(new Point(tiledResource.width, tiledResource.height));
      result.setPoint(new Point(0, 0));
      result.setTileSize(new Point(tiledResource.tilewidth, tiledResource.tileheight));

      // Add listing of referenced tile sets
      const idSortedSets = _.sortBy(tiledResource.tilesets, (o: TiledTSXResource) => {
        return o.firstgid;
      });
      idSortedSets.forEach((tsxRes: TiledTSXResource) => {
        while (result.tileInfo.length < tsxRes.firstgid) {
          result.tileInfo.push(null);
        }
        tsxRes.tiles.forEach((t: any, index: number) => {
          const tilesX = tsxRes.imageWidth / tsxRes.tilewidth;
          const x = index % tilesX;
          const y = Math.floor((index - x) / tilesX);
          result.tileInfo.push({
            url: tsxRes.imageUrl,
            image: tsxRes.image.data,
            imageSize: new Point(tsxRes.imageWidth, tsxRes.imageHeight),
            imagePoint: new Point(x * tsxRes.tilewidth, y * tsxRes.tileheight),
            properties: t
          });
        });
      });
      _.each(tiledResource.tilesets, (tsr: TiledTSXResource) => {
        result.tileSets.push({
          tileSize: new Point(tsr.tilewidth, tsr.tileheight),
          tiles: tsr.tiles,
          url: tsr.imageUrl,
          image: tsr.image.data,
          firstIndex: tsr.firstgid,
          imageSize: new Point(tsr.imageWidth, tsr.imageHeight),
          name: tsr.name
        });
      });

      // Add layers last
      tiledResource.layers.forEach((l: ITiledLayer) => {
        result.addLayer(TiledLayerToPowLayer(l));
      });
      return result;
    });
  }

  /** Write out an XML string for the TiledMap */
  save(location: string, data: EditableTileMap): Promise<any> {
    return this.loader.load(location).then((tiledResources: TiledTMXResource[]) => {
      const tiledResource = tiledResources[0];
      tiledResource.layers = data.layers.map((l: EditableTileLayer) => {
        return PowLayerToTiledLayer(l);
      });
      const out: any = tiledResource.write();
      return vkbeautify.xml(out, 2);
    });
  }

}
