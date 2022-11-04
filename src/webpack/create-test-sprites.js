// @ts-check
const { fstat, writeFileSync } = require("fs");
const SpriteSheetPlugin = require("./sprite-sheet-plugin");
const glob = require("glob");
const path = require("path");

const spritePacker = require("./sprite-sheet-plugin/sprite-packer");
const plugin = new SpriteSheetPlugin();
console.log(plugin.files);

const rootPath = path.resolve(__dirname, "../");

// output file names to emit index json file from
const outputs = [];
const todo = plugin.files;
function processInput() {
  const item = todo.shift();
  // No items left, output index file
  if (!item) {
    const indexJson = JSON.stringify(outputs, null, 2);
    writeFileSync(path.join(rootPath, plugin.options.indexFile), indexJson);
    return;
  }

  // Match glob for inputs (currently just one)
  glob(item.inputs, {}, function (er, files) {
    const spriteOpts = {
      outName: item.output,
    };
    // Generate sprite file and metadata
    spritePacker(files, spriteOpts).then(function spritesDone(results) {
      // Add generated sheet to the outputs list
      outputs.push(item.output);

      // Write the image file for the given output base name
      const png = path.join(rootPath, item.output + ".png");
      writeFileSync(png, results.file, "binary");

      // Write the metadata JSON file for the given output base name
      const json = path.join(rootPath, item.output + ".json");
      const jsonData = JSON.stringify(results.meta, null, 2);
      writeFileSync(json, jsonData);

      // Process the next input
      processInput();
    });
  });
}

processInput();
