var _ = require("underscore");
var fs = require("graceful-fs");
var spritePacker = require("./sprite-packer");
var glob = require("glob");
const webpack = require("webpack");

// For generating TS interfaces
const defaults = {
  indexFile: "index.json",
  scale: 1,
};

function SpriteSheetPlugin(files, options) {
  this.files = files;
  this.options = _.defaults({}, options, defaults);
}

const PLUGIN_NAME = "spritesheets";

SpriteSheetPlugin.prototype.apply = function (compiler) {
  var self = this;
  compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
    compilation.hooks.needAdditionalPass.tap(PLUGIN_NAME, () => false);
    compilation.hooks.processAssets.tapAsync(
      {
        name: PLUGIN_NAME,
        stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
      },
      (assets, callback) => {
        console.log("Writing Spritesheet files...");
        var todo = self.files.slice();

        // output file names to emit index json file from
        var outputs = [];

        // RawSource is one of the "sources" classes that should be used
        // to represent asset sources in compilation.
        const { RawSource } = webpack.sources;

        // Async item processor
        function processInput() {
          const item = todo.shift();
          // No items left, output index file
          if (!item) {
            const indexJson = JSON.stringify(outputs, null, 2);
            compilation.emitAsset(self.options.indexFile, new RawSource(indexJson));
            // Tell webpack that we're done.
            callback();
            return;
          }

          // Match glob for inputs (currently just one)
          glob(item.inputs, null, function (er, files) {
            const spriteOpts = {
              outName: item.output,
            };
            // Generate sprite file and metadata
            spritePacker(files, spriteOpts).then(function spritesDone(results) {
              // Add generated sheet to the outputs list
              outputs.push(item.output);

              // Write the image file for the given output base name
              const png = item.output + ".png";
              compilation.emitAsset(png, new RawSource(results.file));

              // Write the metadata JSON file for the given output base name
              const json = item.output + ".json";
              const jsonData = JSON.stringify(results.meta, null, 2);
              compilation.emitAsset(json, new RawSource(jsonData));

              // Process the next input
              processInput();
            });
          });
        }

        processInput();
      }
    );
  });
};

module.exports = SpriteSheetPlugin;
