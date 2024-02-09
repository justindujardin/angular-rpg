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

function SpriteSheetPlugin() {
  this.files = [
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
  ];
  this.options = {
    indexFile: "assets/images/index.json",
  };
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
            if (compilation.assets[self.options.indexFile]) {
              compilation.updateAsset(self.options.indexFile, new RawSource(indexJson));
            } else {
              compilation.emitAsset(self.options.indexFile, new RawSource(indexJson));
            }
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
              if (compilation.assets[png]) {
                compilation.updateAsset(png, new RawSource(results.file));
              } else {
                compilation.emitAsset(png, new RawSource(results.file));
              }

              // Write the metadata JSON file for the given output base name
              const json = item.output + ".json";
              const jsonData = JSON.stringify(results.meta, null, 2);
              if (compilation.assets[json]) {
                compilation.updateAsset(json, new RawSource(jsonData));
              } else {
                compilation.emitAsset(json, new RawSource(jsonData));
              }

              // Process the next input
              processInput();
            });
          });
        }

        processInput();
      },
    );
  });
};

module.exports = SpriteSheetPlugin;
