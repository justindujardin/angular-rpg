import {IEditorToolbox} from './editor-toolbox';
import {IEditorTool} from './editor-tool';
import {IEditorContext} from './editor-context';
export interface IEditor {
  // lifetime
  initEditor(object: any): boolean;
  destroyEditor(): boolean;

  // tools
  toolbox: IEditorToolbox;
  defaultTools: IEditorTool[];
  setActiveTool(name: string): boolean;
  getActiveTool(): IEditorTool;

  getActiveContext(): IEditorContext;
  pushContext(object: any): boolean;
  popContext(): boolean;
}
