// @ts-check

const { exec } = require("child_process");
const webpack = require("webpack");
const { cwd } = require("process");
const { readFileSync, writeFileSync, createReadStream } = require("fs");
const { createHash } = require("crypto");

const GAME_DATA_COMMAND =
  "npx ts-node --transpile-only --project src/tsconfig.write-game-data.json src/write-game-data.ts";

const PLUGIN_NAME = "write-tiled-game-data";

/** Tiled Editor project JSON file */
const PROJECT_FILE = "angular-rpg.tiled-project";

/** Game data is only written when these files change */
const SOURCE_FILES = [
  "./src/app/models/game-data/armors.ts",
  "./src/app/models/game-data/fixed-encounters.ts",
  "./src/app/models/game-data/items.ts",
  "./src/app/models/game-data/magic.ts",
  "./src/app/models/game-data/random-encounters.ts",
  "./src/app/models/game-data/weapons.ts",
];

const SEEN_HASHES = {};

/** Hash the source files used in write-game-data.ts and only run when they change */
function shouldWriteData() {
  function checksumFile(filename) {
    return new Promise((resolve, reject) => {
      const hash = createHash("sha1");
      const stream = createReadStream(filename);
      stream.on("error", (err) => reject(err));
      stream.on("data", (chunk) => hash.update(chunk));
      stream.on("end", () => resolve(hash.digest("hex")));
    });
  }
  return Promise.all(SOURCE_FILES.map((filename) => checksumFile(filename))).then(
    (hashes) => {
      let should = false;
      SOURCE_FILES.forEach((filename, index) => {
        const hash = hashes[index];
        if (!SEEN_HASHES[filename]) {
          SEEN_HASHES[filename] = hash;
          should = true;
        }
        if (SEEN_HASHES[filename] !== hash) {
          should = true;
        }
        SEEN_HASHES[filename] = hash;
      });
      return should;
    }
  );
}

module.exports = class GameDataPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: PLUGIN_NAME,
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        (assets, callback) => {
          shouldWriteData().then((should) => {
            if (!should) {
              console.log("Skipping Tiled write because source files unchanged");
              callback();
              return;
            }
            console.log("Writing Tiled data files");
            exec(GAME_DATA_COMMAND, (error, stdout, stderr) => {
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
            });
          });
        }
      );
    });
  }
};
