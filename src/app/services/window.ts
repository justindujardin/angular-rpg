
import { Injectable } from '@angular/core';

/**
 * Provide an API for interacting with the window
 */
@Injectable()
export class WindowService {
  reload() {
    window.location.reload();
  }
}
