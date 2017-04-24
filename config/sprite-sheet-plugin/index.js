var _ = require('underscore');
var fs = require('graceful-fs');
var spritePacker = require('./sprite-packer');
var glob = require('glob');

// For generating TS interfaces
const defaults = {
  indexFile: 'index.json',
  scale: 1
};

function SpriteSheetPlugin(files, options) {
  this.files = files;
  this.options = _.defaults({}, options, defaults);
}

SpriteSheetPlugin.prototype.apply = function (compiler) {
  var self = this;

  compiler.plugin("emit", function (compilation, callback) {
    console.log("Writing Spritesheet files...");
    var todo = self.files.slice();

    // output file names to emit index json file from
    var outputs = [];

    // Async item processor
    function processInput() {
      const item = todo.shift();
      // No items left, output index file
      if (!item) {
        const indexJson = JSON.stringify(outputs, null, 2);
        compilation.assets[self.options.indexFile] = {
          size: function () {
            return indexJson.length;
          },
          source: function () {
            return indexJson;
          }
        };
        // Tell webpack that we're done.
        callback();
        return;
      }

      // Match glob for inputs (currently just one)
      glob(item.inputs, null, function (er, files) {
        const spriteOpts = {
          outName: item.output
        };
        // Generate sprite file and metadata
        spritePacker(files, spriteOpts).then(function spritesDone(results) {

          // Add generated sheet to the outputs list
          outputs.push(item.output);

          // Write the image file for the given output base name
          const png = item.output + '.png';
          compilation.assets[png] = {
            size: function () {
              return results.file.length;
            },
            source: function () {
              return results.file;
            }
          };

          // Write the metadata JSON file for the given output base name
          const json = item.output + '.json';
          const jsonData = JSON.stringify(results.meta, null, 2);
          compilation.assets[json] = {
            size: function () {
              return jsonData.length;
            },
            source: function () {
              return jsonData;
            }
          };

          // Process the next input
          processInput();
        });
      })
    }

    processInput();
  });
};

module.exports = SpriteSheetPlugin;
