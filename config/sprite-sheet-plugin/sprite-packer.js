"use strict";
var path = require('path');
var Q = require('q');
var _ = require('underscore');
var fs = require('graceful-fs');
var PNG = require('pngjs').PNG;
var streams = require('memory-streams');
var boxPacker = require('binpacking').GrowingPacker;
function scalePng(png, scale) {
  scale = Math.floor(scale);
  var scaledPng = new PNG({
    width: png.width * scale,
    height: png.height * scale,
    filterType: 0
  });
  for (var y = 0; y < scaledPng.height; y++) {
    for (var x = 0; x < scaledPng.width; x++) {
      var baseX = Math.floor(x / scale);
      var baseY = Math.floor(y / scale);
      var baseIdx = (png.width * baseY + baseX) << 2;
      var idx = (scaledPng.width * y + x) << 2;
      scaledPng.data[idx] = png.data[baseIdx];
      scaledPng.data[idx + 1] = png.data[baseIdx + 1];
      scaledPng.data[idx + 2] = png.data[baseIdx + 2];
      scaledPng.data[idx + 3] = png.data[baseIdx + 3];
    }
  }
  scaledPng.end();
  return scaledPng;
}
function readPngData(file, scale) {
  var defaultsFile = "spriteDefaults.json";
  var deferred = Q.defer();
  var readFile = Q.denodeify(fs.readFile);
  Q.all([
    readFile(file),
    readPngMetaData(path.join(path.dirname(file), defaultsFile), scale),
    readPngMetaData(file, scale)
  ]).spread(function (data, defaultMeta, meta) {
    var stream = new PNG();
    stream.on('parsed', function () {
      var png = scale > 1 ? scalePng(this, scale) : this;
      stream.end();
      deferred.resolve({
        png: png,
        meta: _.extend({}, defaultMeta || {}, meta || {}),
        file: file
      });
    });
    stream.write(data);
  }).catch(function (err) {
    deferred.reject(err);
  });
  return deferred.promise;
}
function readPngMetaData(file, scale) {
  var deferred = Q.defer();
  var file = file.replace(/\.[^\.]+$/, '.json');
  fs.readFile(file, 'utf-8', function (err, data) {
    if (err) {
      deferred.resolve(null);
      return;
    }
    try {
      var obj = JSON.parse(data.toString());
      deferred.resolve(obj);
    }
    catch (e) {
      deferred.reject(e);
    }
  });
  return deferred.promise;
}
function clearFillPng(png) {
  for (var y = 0; y < png.height; y++) {
    for (var x = 0; x < png.width; x++) {
      var idx = (png.width * y + x) << 2;
      png.data[idx] = png.data[idx + 1] = png.data[idx + 2] = png.data[idx + 3] = 0;
    }
  }
  return png;
}
function writePackedImage(name, cells, width, height, spriteSize, scale) {
  var deferred = Q.defer();
  var stream = new PNG({
    width: width,
    height: height
  });
  clearFillPng(stream);
  var baseName = path.basename(name);
  var pngName = name + '.png';
  var writer = new streams.WritableStream();
  // var writer = fs.createWriteStream(pngName);
  _.each(cells, function (cell) {
    cell.png.bitblt(stream, 0, 0, cell.width, cell.height, cell.x, cell.y);
  });
  stream.on('end', function () {
    var metaData = {};
    _.each(cells, function (cell) {
      var fileName = cell.file.substr(cell.file.lastIndexOf("/") + 1);
      var index = (cell.x / (spriteSize * scale)) + (cell.y / (spriteSize * scale)) * (width / spriteSize);
      var width = cell.png.width * scale;
      var height = cell.png.height * scale;
      var metaObj = {
        width: width,
        height: height,
        frames: 1,
        source: baseName,
        index: index,
        x: cell.x,
        y: cell.y
      };
      if (cell.meta) {
        _.extend(metaObj, cell.meta);
        var hasWidth = typeof metaObj.cellWidth !== 'undefined';
        var hasHeight = typeof metaObj.cellHeight !== 'undefined';
        if (hasWidth && hasHeight) {
          metaObj.frames = (cell.png.width / metaObj.cellHeight) * (cell.png.height / metaObj.cellHeight);
        }
      }
      metaData[fileName] = metaObj;
      cell.png.end();
    });
    writer.end();
    deferred.resolve({
      file: writer.toBuffer(),
      name: baseName,
      meta: metaData
    });
  });
  stream.pack().pipe(writer);
  return deferred.promise;
}
module.exports = function (files, options) {
  options = _.extend({}, {
    outName: 'spriteSheet',
    scale: 1
  }, options || {});
  var SOURCE_SPRITE_SIZE = 16;
  if (path.extname(options.outName) !== '') {
    options.outName = options.outName.substr(0, options.outName.lastIndexOf('.'));
  }
  files = _.filter(files, function (file) {
    return path.extname(file) == '.png';
  });
  var readFiles = _.map(files, function (file) {
    return readPngData(file, options.scale);
  });
  return Q.all(readFiles).then(function (filesData) {
    var blocks = _.map(filesData, function (d) {
      return {
        w: d.png.width,
        h: d.png.height,
        data: d
      };
    });
    var needSort = false;
    var blockW = -1;
    var blockH = -1;
    blocks.forEach(function (block) {
      if ((blockW !== -1 && block.w !== blockW) || (block.h !== blockH && blockH !== -1)) {
        needSort = true;
      }
      blockW = block.w;
      blockH = block.h;
    });
    if (needSort) {
      console.log("Sorting " + options.outName + " by size, because it contains sprites of varying sizes.");
      blocks = blocks.sort(function (a, b) {
        return a.w - b.w;
      });
    }
    else {
      blocks = blocks.sort(function (a, b) {
        return path.basename(a.data.file).localeCompare(path.basename(b.data.file));
      });
    }
    var packer = new boxPacker();
    packer.fit(blocks);
    var cells = _.map(blocks, function (b) {
      return {
        width: b.w,
        height: b.h,
        x: b.fit.x,
        y: b.fit.y,
        png: b.data.png,
        meta: b.data.meta,
        file: b.data.file
      };
    });
    return writePackedImage(options.outName, cells, packer.root.w, packer.root.h, SOURCE_SPRITE_SIZE, options.scale);
  });
};
