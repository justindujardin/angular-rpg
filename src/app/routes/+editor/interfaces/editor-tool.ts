import {IEditor} from './editor';
import {IEditorContext} from './editor-context';
export interface IEditorTool {
  editor: IEditor;
  // Human readable name
  name: string;
  // The CSS classname for the icon this tool has
  iconClass: string;
  escapeTool(canCancel: boolean): boolean;
  activateTool(context: IEditorContext): boolean;

}
