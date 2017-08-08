import {IEditorContext} from './editor-context';
import {IEditorTool} from './editor-tool';
export interface IEditorToolbox {
  fillToolbox(context: IEditorContext);
  getToolCount(): number;
  getTools(): IEditorTool[];
  clearTools();
}
