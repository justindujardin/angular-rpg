import {GameFeatureObject} from "../objects/gameFeatureObject";
import {TileComponent} from "../../pow2/tile/tileComponent";

/**
 * A component that defines the functionality of a map feature.
 */
export class GameFeatureComponent extends TileComponent {
  host: GameFeatureObject;

  connectBehavior(): boolean {
    if (!super.connectBehavior()) {
      return false;
    }
    if (!this.host.feature) {
      console.log("Feature host missing feature data.");
      return false;
    }
    // Inherit ID from the unique feature data's id.
    this.id = this.host.feature.id;
    return true;
  }

  syncBehavior(): boolean {
    if (!super.syncBehavior()) {
      return false;
    }
    this.host.visible = this.host.enabled = !this.getDataHidden();
    return true;
  }


  /**
   * Hide and disable a feature object in a persistent manner.
   * @param hidden Whether to hide or unhide the object.
   */
  setDataHidden(hidden: boolean = true) {
    console.warn('fix setDataHidden for hiding map features once they\'ve been destroyed');
    // if (this.host && this.host.world && this.host.world.model && this.host.id) {
    //   this.host.world.model.setKeyData('' + this.host.id, {
    //     hidden: hidden
    //   });
    //   this.syncBehavior();
    // }
  }

  /**
   * Determine if a feature has been persistently hidden by a call
   * to `hideFeature`.
   */
  getDataHidden(): boolean {
    console.warn('fix getDataHidden for hiding map features once they\'ve been destroyed');
    // if (this.host && this.host.world && this.host.world.model && this.host.id) {
    //   var data: any = this.host.world.model.getKeyData('' + this.host.id);
    //   if (data && data.hidden) {
    //     return true;
    //   }
    // }
    return false;
  }
}
