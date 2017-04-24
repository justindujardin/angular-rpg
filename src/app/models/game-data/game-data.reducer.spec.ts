import {EntityCollection} from '../base-entity';
import {GameDataState, gameDataReducer} from './game-data.reducer';
import {GameDataAddSheetAction, GameDataRemoveSheetAction} from './game-data.actions';
import {ITemplateId} from './game-data.model';

describe('GameData', () => {

  function defaultState(collection?: string, values?: Partial<EntityCollection<any>>): GameDataState {
    const resultState: GameDataState = {
      weapons: {
        byId: {},
        allIds: []
      },
      armor: {
        byId: {},
        allIds: []
      },
      enemies: {
        byId: {},
        allIds: []
      },
      items: {
        byId: {},
        allIds: []
      },
      magic: {
        byId: {},
        allIds: []
      },
      classes: {
        byId: {},
        allIds: []
      },
      fixedEncounters: {
        byId: {},
        allIds: []
      },
      randomEncounters: {
        byId: {},
        allIds: []
      }
    };
    if (collection && values) {
      return Object.assign(resultState, {
        [collection]: Object.assign(values)
      });
    }
    return Object.assign({}, resultState);
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
        const initial: GameDataState = defaultState();
        const item = fakeItem();
        const desired: GameDataState = defaultState('weapons', {
          allIds: [item.id],
          byId: {[item.id]: item}
        });
        const out = gameDataReducer(initial, new GameDataAddSheetAction('weapons', [item]));
        expect(out).toEqual(desired);
      });
      it('should ignore unknown sheet names', () => {
        const initial: GameDataState = defaultState();
        const out = gameDataReducer(initial, new GameDataAddSheetAction('invalid', [fakeItem()]));
        expect(out).toEqual(initial);
      });
    });
    describe('GameDataRemoveSheetAction', () => {
      it('should remove all data from a sheet with the given name', () => {
        const item = fakeItem();
        const initial: GameDataState = defaultState('weapons', {
          allIds: [item.id],
          byId: {[item.id]: item}
        });
        const desired: GameDataState = defaultState();
        const out = gameDataReducer(initial, new GameDataRemoveSheetAction('weapons'));
        expect(out).toEqual(desired);
      });
      it('should ignore unknown sheet names', () => {
        const item = fakeItem();
        const initial: GameDataState = defaultState('weapons', {
          allIds: [item.id],
          byId: {[item.id]: item}
        });
        const out = gameDataReducer(initial, new GameDataRemoveSheetAction('invalid'));
        expect(out).toEqual(initial);
      });
    });
  });
});
