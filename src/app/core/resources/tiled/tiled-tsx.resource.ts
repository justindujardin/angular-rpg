
import * as _ from 'underscore';
import { assertTrue } from '../../../models/util';
import { ImageResource } from '../image.resource';
import { XMLResource } from '../xml.resource';
import { compactUrl, ITileInstanceMeta, readTiledProperties } from './tiled';

export class TilesetTile {
  public properties: any = {};

  constructor(
    public id: number,
    public image: string,
    public width: number,
    public height: number
  ) {}
}
/**
 * A Tiled TSX tileset resource
 */
export class TiledTSXResource extends XMLResource {
  name: string | null = null;
  tilewidth: number = 16;
  tileheight: number = 16;
  imageWidth: number = 0;
  imageHeight: number = 0;
  image: ImageResource | null = null;
  url: string;
  firstgid: number = -1;
  tiles: { [gid: string]: TilesetTile } | null = null;
  maxLocalId: number = -1;
  imageUrl: string | null = null;
  relativeTo: string | null = null;
  literal: string | null = null; // The literal source path specified in xml
  load(data?: any): Promise<TiledTSXResource> {
    this.data = data || this.data;
    return new Promise<TiledTSXResource>((resolve, reject) => {
      const tileSet = this.getRootNode('tileset');
      this.name = this.getElAttribute(tileSet, 'name');
      this.tilewidth = parseInt(this.getElAttribute(tileSet, 'tilewidth'), 10);
      this.tileheight = parseInt(this.getElAttribute(tileSet, 'tileheight'), 10);
      const relativePath: string = this.url
        ? this.url.substr(0, this.url.lastIndexOf('/') + 1)
        : '';

      // Load tiles and custom properties.
      const tilesArray: TilesetTile[] = [];
      const tiles = this.getChildren(tileSet, 'tile');
      _.each(tiles, (ts: any) => {
        const id: number = parseInt(this.getElAttribute(ts, 'id'), 10);
        if (id > this.maxLocalId) {
          this.maxLocalId = id;
        }
        const sourceImage = this.getChild(ts, 'image');
        if (!sourceImage) {
          throw new Error(
            'tileset tiles must be image collections that reference the soruce sprite image'
          );
        }
        // extract only the filename from the source image path
        let image: string = this.getElAttribute(sourceImage, 'source');
        image = image.substring(image.lastIndexOf('/') + 1);
        const width = parseInt(this.getElAttribute(sourceImage, 'width'), 10);
        const height = parseInt(this.getElAttribute(sourceImage, 'height'), 10);
        const tile: TilesetTile = new TilesetTile(id, image, width, height);
        tile.properties = readTiledProperties(ts);
        tilesArray.push(tile);
      });

      const source = this.name;
      assertTrue(source, `invalid source name in tileset: ${source}`);
      this.imageUrl = compactUrl(
        this.relativeTo ? this.relativeTo : relativePath,
        source
      );

      new ImageResource(this.imageUrl)
        .fetch()
        .then((res?: ImageResource) => {
          if (!res) {
            throw new Error(`null response`);
          }
          this.image = res;
          this.imageWidth = this.image.data.width;
          this.imageHeight = this.image.data.height;

          // Finally, build a tile lookup table
          const tileLookup: { [tileId: string]: TilesetTile } = {};
          _.each(tilesArray, (tile) => {
            tileLookup[tile.id] = tile;
          });
          this.tiles = tileLookup;

          resolve(this);
        })
        .catch((e) => {
          reject(`Failed to load required tile map image: ${source} - ${e}`);
        });
    });
  }

  hasGid(gid: number): boolean {
    const localId = this.firstgid !== -1 ? gid - this.firstgid : gid;
    return gid >= this.firstgid && localId <= this.maxLocalId;
  }

  getTileMeta(gidOrIndex: number): ITileInstanceMeta {
    assertTrue(this.tiles, 'null tiles array in tsx resource');
    const index: number =
      this.firstgid !== -1 ? gidOrIndex - this.firstgid : gidOrIndex;
    const tile = this.tiles[index];
    return _.extend(tile || {}, {
      sheet: this.image,
      width: this.tilewidth,
      height: this.tileheight,
    });
  }
}
