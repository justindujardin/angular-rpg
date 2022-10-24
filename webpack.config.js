const { merge } = require("webpack-merge");
const SpriteSheetPlugin = require("./src/webpack/sprite-sheet-plugin");

// Config parameter is Angular default configurations.
module.exports = function (angularConfig) {
  return merge(angularConfig, {
    plugins: [
      /*
       * Plugin: SpriteSheetPlugin
       * Description: Generate sprite sheet images from a list of source files
       */
      new SpriteSheetPlugin(
        [
          {
            inputs: "src/art/sprites/objects/*.png",
            output: "assets/images/objects",
          },
          {
            inputs: "src/art/sprites/creatures/*.png",
            output: "assets/images/creatures",
          },
          {
            inputs: "src/art/sprites/vehicles/*.png",
            output: "assets/images/vehicles",
          },
          {
            inputs: "src/art/sprites/environment/*.png",
            output: "assets/images/environment",
          },
          {
            inputs: "src/art/sprites/characters/punch/*.png",
            output: "assets/images/punch",
          },
          {
            inputs: "src/art/sprites/characters/magic/*.png",
            output: "assets/images/magic",
          },
          {
            inputs: "src/art/sprites/characters/*.png",
            output: "assets/images/characters",
          },
          {
            inputs: "src/art/sprites/animation/*.png",
            output: "assets/images/animation",
          },
          {
            inputs: "src/art/sprites/equipment/*.png",
            output: "assets/images/equipment",
          },
          { inputs: "src/art/sprites/items/*.png", output: "assets/images/items" },
        ],
        {
          indexFile: "assets/images/index.json",
        }
      ),
    ],
  });
};
