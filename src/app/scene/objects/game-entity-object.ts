
import { CombatantTypes } from '../../models/base-entity';
import { GameWorld } from '../../services/game-world';
import { TileObject } from '../tile-object';

export class GameEntityObject extends TileObject {
  model: CombatantTypes | null;
  type = 'player';
  groups: any;
  world: GameWorld;

  private _visible: boolean = true;
  // @ts-ignore
  get visible(): boolean {
    return Boolean(this._visible && this.model && this.model.hp > 0);
  }
  set visible(value: boolean) {
    this._visible = value;
  }
}
