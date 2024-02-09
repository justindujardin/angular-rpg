
import { SceneObjectBehavior } from './scene-object-behavior';
/**
 * A behavior that receives tick and interpolateTick callbacks
 */
export class TickedBehavior extends SceneObjectBehavior {
  tickRateMS: number = 300;

  /**
   * Update the component at a tick interval.
   */
  tick(elapsed: number) {
    // nothing
  }

  /**
   * Interpolate component state between ticks.
   */
  interpolateTick(elapsed: number) {
    // nothing
  }
}
