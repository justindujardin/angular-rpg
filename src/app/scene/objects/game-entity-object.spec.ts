import { IPartyMember } from '../../models/base-entity';
import { entityId } from '../../models/game-data/game-data.model';
import { GameEntityObject } from './game-entity-object';

describe('GameEntityObject', () => {
  function testPartyMember(values?: Partial<IPartyMember>): IPartyMember {
    return Object.assign(
      {
        eid: entityId('test-entity'),
        mp: 0,
        maxmp: 0,
        hp: 0,
        maxhp: 0,
      },
      values || {}
    ) as any;
  }

  it('is defined', () => expect(GameEntityObject).toBeDefined());

  it('visible property evaluates to false when model.hp equals 0', () => {
    const gameEntity = new GameEntityObject();
    // No model by default, so visible is false
    expect(gameEntity.visible).toBeFalse();
    // Valid model with hp == 0 so visible is false
    gameEntity.model = testPartyMember({ hp: 0 });
    expect(gameEntity.visible).toBeFalse();
    // Valid model with hp > 0 so visible is true
    gameEntity.model = testPartyMember({ hp: 10 });
    expect(gameEntity.visible).toBeTrue();
    // Valid model with hp > 0 can be manually made invisible
    gameEntity.visible = false;
    expect(gameEntity.visible).toBeFalse();
  });
});
