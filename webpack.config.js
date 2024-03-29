const { merge } = require("webpack-merge");
const GameDataPlugin = require("./src/webpack/game-data-plugin");
const SpriteSheetPlugin = require("./src/webpack/sprite-sheet-plugin");

// Config parameter is Angular default configurations.
module.exports = function (angularConfig) {
  return merge(angularConfig, {
    plugins: [
      /*
       * Plugin: SpriteSheetPlugin
       * Description: Generate sprite sheet images from a list of source files
       */
      new SpriteSheetPlugin(),
      new GameDataPlugin(),
    ],
  });
};
