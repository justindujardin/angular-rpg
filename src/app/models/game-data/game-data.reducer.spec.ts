import {addEntityToCollection, EntityCollectionRecord} from '../base-entity';
import {gameDataFactory, gameDataReducer, GameDataStateRecord} from './game-data.reducer';
import {GameDataAddSheetAction, GameDataRemoveSheetAction} from './game-data.actions';
import {ITemplateId} from './game-data.model';

describe('GameData', () => {

  function defaultState(collection?: string, items?: ITemplateId[]): GameDataStateRecord {
    let resultState: GameDataStateRecord = gameDataFactory();
    if (collection && items) {
      resultState = resultState.updateIn([collection], (record: EntityCollectionRecord) => {
        items.forEach((data: ITemplateId) => {
          record = addEntityToCollection(record, data, data.id);
        });
        return record;
      });
    }
    return resultState;
  }

  let counter = 0;

  function fakeItem(uniqueId: number = counter++): ITemplateId {
    const testItem: ITemplateId = {
      id: 'test-item-' + uniqueId
    };
    return Object.assign({}, testItem);
  }

  describe('Actions', () => {
    describe('GameDataAddSheetAction', () => {
      it('should add a sheet of data to a table with the given name', () => {
        const initial: GameDataStateRecord = defaultState();
        const item = fakeItem();
        const desired: GameDataStateRecord = defaultState('weapons', [item]);
        const out = gameDataReducer(initial, new GameDataAddSheetAction('weapons', [item])) as GameDataStateRecord;
        expect(out.weapons).toEqual(desired.weapons);
      });
      it('should throw given an unknown sheet name', () => {
        const initial: GameDataStateRecord = defaultState();
        const item = fakeItem();
        expect(() => {
          gameDataReducer(initial, new GameDataAddSheetAction('invalid', [item]));
        }).toThrow();
      });
    });
    describe('GameDataRemoveSheetAction', () => {
      it('should remove all data from a sheet with the given name', () => {
        const item = fakeItem();
        const initial: GameDataStateRecord = defaultState('weapons', [item]);
        const out = gameDataReducer(initial, new GameDataRemoveSheetAction('weapons')) as GameDataStateRecord;
        expect(out.weapons.byId.count()).toBe(0);
        expect(out.weapons.allIds.count()).toBe(0);
      });
      it('should throw with unknown sheet name', () => {
        const item = fakeItem();
        const initial: GameDataStateRecord = defaultState('weapons', [item]);
        expect(() => {
          gameDataReducer(initial, new GameDataRemoveSheetAction('invalid'));
        }).toThrow();
      });
    });
  });
});
