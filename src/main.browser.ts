/*
 * Angular bootstraping
 */
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {decorateModuleRef} from './app/environment';
import {bootloader} from '@angularclass/hmr';
import {AppModule} from './app';
import {GameWorld} from './game/gameWorld';
import {registerWorld} from './game/pow-core/api';
/*
 * App Module
 * our top level module that holds all of our components
 */

/*
 * Bootstrap our Angular app with a top level NgModule
 */
export function main(): Promise<any> {
  const world = GameWorld.get();
  registerWorld('rpg', world);
  return new Promise((resolve, reject) => {
    const subscription = world.ready$.subscribe(() => {
      subscription.unsubscribe();
      resolve();
    });
    platformBrowserDynamic().bootstrapModule(AppModule)
      .then(decorateModuleRef)
      .catch(err => {
        console.error(err);
        reject(err);
      });

  });
}


// needed for hmr
// in prod this is replace for document ready
bootloader(main);
