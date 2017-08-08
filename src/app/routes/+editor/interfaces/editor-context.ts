import {IEditorTool} from './editor-tool';
import {IEditor} from './editor';
export interface IEditorContext {

  getTools(): IEditorTool[];

  getEditor(): IEditor;
  setEditor(editor: IEditor): boolean;

  enterContext(source: any): boolean;
  exitContext(): boolean;

  getContextSource(): any;
  setContextSource(object: any): boolean;

  setActiveTool(name: string): boolean;
  getActiveTool(): IEditorTool;

  setDefaultTool(name: string): boolean;
  getDefaultTool(): IEditorTool;
}
