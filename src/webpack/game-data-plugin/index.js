// @ts-check

const { exec } = require("child_process");
const webpack = require("webpack");
const { cwd } = require("process");
const { readFileSync, writeFileSync } = require("fs");

const PLUGIN_NAME = "write-tiled-game-data";

/** Tiled Editor project JSON file */
const PROJECT_FILE = "angular-rpg.tiled-project";

module.exports = class GameDataPlugin {
  apply(compiler) {
    var self = this;
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: PLUGIN_NAME,
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        (assets, callback) => {
          console.log("Writing game data files...");
          console.log("CWD = " + cwd());

          exec(
            "npx ts-node --project src/tsconfig.write-game-data.json src/write-game-data.ts",
            (error, stdout, stderr) => {
              if (error) {
                console.log(`error: ${error.message}`);
                callback();
                return;
              }
              const projectFile = JSON.parse(readFileSync(PROJECT_FILE).toString());
              const inData = JSON.stringify(projectFile, null, 4);
              const propertyTypes = projectFile.propertyTypes;
              let maxPropertyTypeId = 0;
              propertyTypes.forEach((p) => {
                if (p.id > maxPropertyTypeId) {
                  maxPropertyTypeId = p.id;
                }
              });

              const gameData = JSON.parse(stdout);
              gameData.forEach((object) => {
                const existingType = propertyTypes.find((p) => p.name === object.name);
                if (!existingType) {
                  // Create a new type
                  projectFile.propertyTypes.push({
                    ...object,
                    id: ++maxPropertyTypeId,
                  });
                } else {
                  // Update the existing type
                  Object.keys(existingType).forEach((key) => {
                    if (key !== "id") {
                      delete existingType[key];
                    }
                  });
                  Object.keys(object).forEach((propKey) => {
                    existingType[propKey] = object[propKey];
                  });
                }
              });
              const outData = JSON.stringify(projectFile, null, 4);
              if (inData !== outData) {
                writeFileSync(PROJECT_FILE, outData);
                console.log("Writing to: " + PROJECT_FILE);
              }
              callback();
            }
          );
        }
      );
    });
  }
};
