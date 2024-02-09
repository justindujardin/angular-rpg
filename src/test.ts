// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import 'zone.js/testing'; // tslint:disable:ordered-imports (NOTE: this MUST be the first import or tests will fail)
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
}
);
