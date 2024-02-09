
import _ from 'underscore';
import { SceneObjectBehavior } from '../../../behaviors/scene-object-behavior';
import { AudioResource, ImageResource, ResourceManager } from '../../../core';
import { ITemplateMagic } from '../../../models/game-data/game-data.model';
import { Item } from '../../../models/item';
import { assertTrue } from '../../../models/util';
import { GameEntityObject } from '../../../scene/objects/game-entity-object';
import { GameWorld } from '../../../services/game-world';
import { IPlayerAction } from '../combat.types';

export class CombatActionBehavior extends SceneObjectBehavior implements IPlayerAction {
  name: string = 'default';
  from: GameEntityObject | null = null;
  to: GameEntityObject | null = null;
  spell: ITemplateMagic | null = null;
  item: Item | null = null;
  _uid: string = _.uniqueId('ca');

  /** A map of key/url for sound resources this action uses. Calling preload() will load these */
  sounds: { [key: string]: string } | null = null;
  /** A map of key/icon for sprites this action uses. Calling preload() will load these */
  sprites: { [key: string]: string } | null = null;

  constructor(protected loader: ResourceManager, protected gameWorld: GameWorld) {
    super();
  }

  /**
   * Determine if this action can target specific combatants or not. For example
   * a Guard action does not have a target, so it would return false.
   */
  canTarget(): boolean {
    return true;
  }

  /**
   * Method used to determine if this action is usable by a given
   * [GameEntityObject].  This may be subclassed in an action to
   * select the types of entities that may use the action.
   * @param entity The object that would use the action.
   * @returns {boolean} True if the entity may use this action.
   */
  canBeUsedBy(entity: GameEntityObject): boolean {
    // return entity.model && entity.model instanceof EntityModel;
    return true;
  }

  /**
   * Base class invokes the then callback and returns true.
   * @returns {boolean} Whether the act was successful or not.
   */
  async act(): Promise<boolean> {
    return Promise.reject('do not call super on .act()');
  }

  /**
   * The action has been selected for the current turn.
   */
  select() {
    // nothing
  }

  /** Preload any sprites/sounds that the action requires */
  async preload(): Promise<(AudioResource | ImageResource)[]> {
    const spriteSheets = _.uniq(
      Object.values(this.sprites || []).map((spriteName: string) => {
        const meta = this.gameWorld.sprites.getSpriteMeta(spriteName);
        assertTrue(meta, `no metadata for sprite: ${spriteName}`);
        return meta.source;
      })
    );
    const sounds = _.uniq(Object.values(this.sounds || []));
    return Promise.all([
      ...spriteSheets.map((s) => this.gameWorld.sprites.getSpriteSheet(s)),
      ...sounds.map((s) => this.loader.load<AudioResource>(s)),
    ]).then((arrays) => {
      // Flatten
      let result: (ImageResource | AudioResource)[] = [];
      for (let i = 0; i < arrays.length; i++) {
        result = result.concat(arrays[i]);
      }
      return result;
    });
  }
}
