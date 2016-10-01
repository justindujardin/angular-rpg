/*
 Copyright (C) 2013-2015 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

declare var $: any;
import * as _ from 'underscore';


// -------------------------------------------------------------------------
// Implement a subset of the Tiled editor format:
//
// https://github.com/bjorn/tiled/wiki/TMX-Map-Format

export interface ITileInstanceMeta {
  image: HTMLImageElement;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data?: any;
}

export interface ITiledBase {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  _xml: any;
}

// <layer>, <objectgroup>
export interface ITiledLayerBase extends ITiledBase {
  opacity: number; // 0-1
  properties?: any;
}
export interface ITiledLayer extends ITiledLayerBase {
  data?: any;
  color?: string;
  objects?: ITiledObject[];
}

// <object>
export interface ITiledObject extends ITiledBase {
  properties?: any;
  rotation?: number;
  type?: string;
  gid?: number;
  color?: string;
}

export interface ITileSetDependency {
  source?: string; // Path to URL source from which to load data.
  data?: any; // Data instead of source.
  firstgid: number; // First global id.
  literal?: string; // The literal string representing the source as originally specified in xml
}


// Tiled object XML reading utilities.
export function readITiledBase(el: any): ITiledBase {
  return {
    name: getElAttribute(el, 'name'),
    x: parseInt(getElAttribute(el, 'x') || "0"),
    y: parseInt(getElAttribute(el, 'y') || "0"),
    width: parseInt(getElAttribute(el, 'width') || "0"),
    height: parseInt(getElAttribute(el, 'height') || "0"),
    visible: parseInt(getElAttribute(el, 'visible') || "1") === 1, // 0 or 1,
    _xml: el
  };
}

export function writeITiledBase(el: any, data: ITiledObject) {
  setElAttribute(el, 'name', data.name);
  if (data.type) {
    setElAttribute(el, 'type', data.type);
  }
  if (data.x !== 0) {
    setElAttribute(el, 'x', data.x);
  }
  if (data.y !== 0) {
    setElAttribute(el, 'y', data.y);
  }
  setElAttribute(el, 'width', data.width);
  setElAttribute(el, 'height', data.height);
  if (data.visible === false) {
    setElAttribute(el, 'visible', data.visible);
  }
  if (typeof data.color !== 'undefined') {
    setElAttribute(el, 'color', data.color);
  }
}

export function writeITiledObjectBase(el: any, data: ITiledObject) {
  writeITiledBase(el, data);
}

export function readITiledObject(el: any): ITiledObject {
  // Base layer properties
  var result: ITiledObject = <ITiledObject>readITiledLayerBase(el);
  var type: string = getElAttribute(el, 'type');
  if (type) {
    result.type = type;
  }
  return result;
}

export function readITiledLayerBase(el: any): ITiledLayerBase {
  // Base layer properties
  var result: ITiledLayerBase = <ITiledLayerBase>readITiledBase(el);
  // Layer opacity is 0-1
  result.opacity = parseInt(getElAttribute(el, 'opacity') || "1");
  // Custom properties
  var props = readTiledProperties(el);
  if (props) {
    result.properties = props;
  }
  return result;
}

// StackOverflow: http://stackoverflow.com/questions/14780350/convert-relative-path-to-absolute-using-javascript
export function compactUrl(base: string, relative: string) {
  var stack = base.split("/");
  var parts = relative.split("/");
  stack.pop(); // remove current file name (or empty string)
  // (omit if "base" is the current folder without trailing slash)
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] == ".")
      continue;
    if (parts[i] == "..")
      stack.pop();
    else
      stack.push(parts[i]);
  }
  return stack.join("/");
}

export function xml2Str(xmlNode) {

  try {
    // Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
    return (new XMLSerializer()).serializeToString(xmlNode);
  }
  catch (e) {
    try {
      // Internet Explorer.
      return xmlNode.xml;
    }
    catch (e) {
      //Other browsers without XML Serializer
      throw new Error('Xmlserializer not supported');
    }
  }
}


export function writeITiledLayerBase(el: any, data: ITiledLayerBase) {
  writeITiledBase(el, data);
  setElAttribute(el, 'opacity', data.opacity);
  writeTiledProperties(el, data.properties);
}

export function readTiledProperties(el: any) {
  var propsObject: any = getChild(el, 'properties');
  if (propsObject && propsObject.length > 0) {
    var properties = {};
    var props = getChildren(propsObject, 'property');
    _.each(props, (p) => {
      var key = getElAttribute(p, 'name');
      var value: any = getElAttribute(p, 'value');

      // Do some horrible type guessing.
      if (typeof value === 'string') {
        var checkValue: any = value.toLowerCase();
        if (checkValue === 'true' || checkValue === 'false') {
          value = checkValue === 'true';
        }
        else if (!isNaN((checkValue = parseFloat(value)))) {
          value = checkValue
        }
      }
      properties[key] = value;
    });
    return properties;
  }
  return null;
}

export function writeTiledProperties(el: any, data: any) {
  var result: any = $('<properties/>');
  _.each(data, (value: any, key: string)=> {
    var prop: any = $('<property/>');
    setElAttribute(prop, 'name', key);
    setElAttribute(prop, 'value', value);
    result.append(prop);
  });
  if (result.children().length > 0) {
    el.append(result);
  }
}

// XML Utilities

export function getChildren(el: any, tag: string): any[] {
  var list = el.find(tag);
  return _.compact(_.map(list, function (c) {
    var child: any = $(c);
    return child.parent()[0] !== el[0] ? null : child;
  }));
}

export function getChild(el: any, tag: string): any {
  return getChildren(el, tag)[0];
}

export function setElAttribute(el: any, name: string, value: any) {
  el.attr(name, value);
}

export function getElAttribute(el: any, name: string): string {
  return el.attr(name) || null;
}
