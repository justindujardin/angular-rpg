import { errors } from './errors';

export interface IResource {
  url: string | null;
  data: any | null;
  extension: string;
  fetch(url?: string): Promise<IResource>;
  load(data?: any): Promise<IResource>;
}

/**
 * Promise based resource loading class. Loads from given URL or data.
 */
export class Resource implements IResource {
  extension: string;

  constructor(
    public url: string | null = null,
    public data: any = null,
  ) {}

  load(data?: any): Promise<Resource> {
    return Promise.reject(errors.CLASS_NOT_IMPLEMENTED);
  }

  fetch(url?: string): Promise<Resource> {
    return Promise.reject(errors.CLASS_NOT_IMPLEMENTED);
  }
}
