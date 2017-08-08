import {IAction} from './action';
export interface IActionManager {
  clear();
  redo(): IAction;
  undo(): IAction;

  getUndoCount(): number;
  getRedoCount(): number;

  getUndoName(index: number): string;
  getRedoName(index: number): string;

  executeAction(action: IAction): boolean;
}
