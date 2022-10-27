const { merge } = require("webpack-merge");
const SpriteSheetPlugin = require("../src/webpack/sprite-sheet-plugin");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.ts"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  core: {
    builder: "webpack5",
  },
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.
    return merge(config, {
      plugins: [
        /*
         * Plugin: SpriteSheetPlugin
         * Description: Generate sprite sheet images from a list of source files
         */
        new SpriteSheetPlugin(),
      ],
    });
  },
};
