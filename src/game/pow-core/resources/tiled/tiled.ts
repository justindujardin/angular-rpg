/*! Copyright (c) 2013-2017 Justin DuJardin and Contributors. MIT License. */
import * as _ from 'underscore';
import {ITiledBase, ITiledObject, ITiledLayerBase} from './tiled.model';
import * as $ from 'jquery';
export interface ITileInstanceMeta {
  image: HTMLImageElement;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data?: any;
}

// Tiled object XML reading utilities.
export function readITiledBase(el: any): ITiledBase {
  return {
    name: getElAttribute(el, 'name'),
    x: parseInt(getElAttribute(el, 'x') || '0', 10),
    y: parseInt(getElAttribute(el, 'y') || '0', 10),
    width: parseInt(getElAttribute(el, 'width') || '0', 10),
    height: parseInt(getElAttribute(el, 'height') || '0', 10),
    visible: parseInt(getElAttribute(el, 'visible') || '1', 10) === 1, // 0 or 1,
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
  const result: ITiledObject = readITiledLayerBase(el);
  const type: string = getElAttribute(el, 'type');
  if (type) {
    result.type = type;
  }
  return result;
}

export function readITiledLayerBase(el: any): ITiledLayerBase {
  // Base layer properties
  const result: ITiledLayerBase = readITiledBase(el) as ITiledLayerBase;
  // Layer opacity is 0-1
  result.opacity = parseInt(getElAttribute(el, 'opacity') || '1', 10);
  // Custom properties
  const props = readTiledProperties(el);
  if (props) {
    result.properties = props;
  }
  return result;
}

// StackOverflow: http://stackoverflow.com/questions/14780350/convert-relative-path-to-absolute-using-javascript
export function compactUrl(base: string, relative: string) {
  const stack = base.split('/');
  const parts = relative.split('/');
  stack.pop(); // remove current file name (or empty string)
  // (omit if "base" is the current folder without trailing slash)
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '.') {
      continue;
    }
    if (parts[i] === '..') {
      stack.pop();
    }
    else {
      stack.push(parts[i]);
    }
  }
  return stack.join('/');
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
      // Other browsers without XML Serializer
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
  const propsObject: any = getChild(el, 'properties');
  if (propsObject && propsObject.length > 0) {
    const properties = {};
    let props = getChildren(propsObject, 'property');
    _.each(props, (p) => {
      const key = getElAttribute(p, 'name');
      let value: any = getElAttribute(p, 'value');

      // Do some horrible type guessing.
      if (typeof value === 'string') {
        let checkValue: any = value.toLowerCase();
        let checkNumber = parseFloat(value);
        if (checkValue === 'true' || checkValue === 'false') {
          value = checkValue === 'true';
        }
        else if (!isNaN((checkNumber))) {
          value = checkNumber;
        }
      }
      properties[key] = value;
    });
    return properties;
  }
  return null;
}

export function writeTiledProperties(el: any, data: any) {
  const result: any = $('<properties/>');
  _.each(data, (value: any, key: string) => {
    const prop: any = $('<property/>');
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
  const list = el.find(tag);
  return _.compact(_.map(list, (c) => {
    const child: any = $(c);
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
