export interface IAction {
  name: string;
  executed: boolean;
  execute(): boolean;
  undo(): boolean;
}

export interface ICompositeAction extends IAction {
  getAction<T>(index: number): T;
  addAction(action: IAction);
  getActionCount(action: IAction): number;
}
