var _ = require('underscore');
var fs = require('graceful-fs');
var spritePacker = require('./sprite-packer');
var glob = require('glob');

// For generating TS interfaces
const defaults = {
  outName: 'spriteSheet',
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

    function processInput() {
      const item = todo.shift();
      if (!item) {
        callback();
        return;
      }
      glob(item.inputs, null, function (er, files) {
        spritePacker(files, {
          outName: item.output
        }).then(function spritesDone(results) {
          const png = item.output + '.png';
          const json = item.output + '.json';
          compilation.assets[png] = {
            size: function () {
              return results.file.length;
            },
            source: function () {
              return results.file;
            }
          };
          const jsonData = JSON.stringify(results.meta, null, 2);
          compilation.assets[json] = {
            size: function () {
              return jsonData.length;
            },
            source: function () {
              return jsonData;
            }
          };
          processInput();
        });
      })
    }
    processInput();
    callback();
  });
};

module.exports = SpriteSheetPlugin;
