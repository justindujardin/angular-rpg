export interface IAppPlatform {
  readFile(location: string, done: (data: any) => any);
  writeFile(location: string, data: any, done: (error: any) => any);

  setTitle(text: string);
  enumPath(location: string, done: (err: any, files?: IFileInfo[]) => any);
  getDirName(location: string): string;

  normalizePath(url: string): string;

  pathAsAppProtocol(url: string): string;
  pathAsFile(url: string): string;
}

export interface IFileInfo {
  name: string; // name
  path: string; // path
  full: string; // path.join(path,name)
  type?: string; // "directory" or "file"
  children?: IFileInfo[]; // Only used for directories.
}
