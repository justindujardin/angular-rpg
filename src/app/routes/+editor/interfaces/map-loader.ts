import {EditableTileMap} from '../formats/editable-map';

export interface IMapLoader {
  load(location: string, data: any): Promise<EditableTileMap>;
  save(location: string, data: EditableTileMap): Promise<EditableTileMap>;
}
