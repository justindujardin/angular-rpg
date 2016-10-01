/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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

import {Entity} from '../entity';
import {JSONResource} from './json';
import {errors} from '../errors';
import * as _ from 'underscore';

export enum EntityError {
  NONE = 0,
  ENTITY_TYPE = 1,
  COMPONENT_TYPE = 2,
  COMPONENT_NAME_DUPLICATE = 4,
  COMPONENT_REGISTER = 8,
  COMPONENT_INPUT = 16,
  INPUT_NAME = 32,
  INPUT_TYPE = 64
}

/**
 * Dictionary of name -> type inputs that are used to create various
 * composite entity objects.
 */
export interface IEntityInputsMap {
  [name: string]: string
}

/**
 * The basic description of an object that may be instantiated with custom constructor
 * arguments.
 */
export interface IEntityObject {
  /**
   * The name of the entity to use when creating.
   */
  name: string;
  /**
   * The object type to use for the entity.  Assumed to be an [[ISceneObjectComponentHost]] type.
   */
    type: string;
  /**
   * An array of inputs for the constructor call to the output object of `type`.
   */
  params: string[];
}

/**
 * A composite entity template that describes the inputs and outputs of
 * an entity that may be instantiated.
 */
export interface IEntityTemplate extends IEntityObject {

  /**
   * A map of named inputs and their types.
   */
  inputs: IEntityInputsMap;

  /**
   * An array of components to instantiate and add to the output container.
   */
  components: IEntityObject[];
}

/**
 * JSON resource describing an array of [[IEntityTemplate]]s that can be used for composite
 * object creation with validated input types.
 */
export class EntityContainerResource extends JSONResource {

  static IMPORT_SPLITTER: string = '|';


  /**
   * Instantiate an object and set of components from a given template.
   * @param templateName The name of the template in the resource.
   * @param inputs An object of input values to use when instantiating objects and components.
   * @returns {*} The resulting object or null
   */
  createObject(templateName: string, inputs?: any): Promise<any> {
    // Valid template name.
    var tpl: any = this.getTemplate(templateName);
    if (!tpl) {
      return Promise.reject('invalid template');
    }

    return this
      .validateTemplate(tpl, inputs)
      .then(() => <any>this._fetchImportModule(tpl.type))
      .then((type: any)=> {
        // Create entity object
        //
        // If inputs.params are specified use them explicitly, otherwise pass the inputs
        // dire
        var inputValues: any[] = tpl.params ? _.map(tpl.params, (n: string)=> {
          return inputs[n];
        }) : [inputs];


        var object: Entity = this.constructObject(type, inputValues);

        return Promise.all(_.map(tpl.components, (comp: IEntityObject) => {
          return new Promise<void>((resolve, reject) => {
            var inputValues: any[] = _.map(comp.params || [], (n: string)=> {
              return inputs[n];
            });
            this._fetchImportModule(comp.type)
              .then((ctor: any) => {
                var compObject = this.constructObject(ctor, inputValues);
                compObject.name = comp.name;
                if (!object.addComponent(compObject)) {
                  reject(errors.COMPONENT_REGISTER_FAIL);
                }
                resolve(compObject);
              }).catch(reject);

          });
        })).then(() => object).catch(() => null);
      });
  }

  /**
   * Validate a template object's correctness, returning a string
   * error if incorrect, or null if correct.
   *
   * @param templateData The template to verify
   * @param inputs
   */
  validateTemplate(templateData: any, inputs?: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this._fetchImportModule(templateData.type)
        .then((type: any): any => {
          if (!type) {
            return reject(EntityError.ENTITY_TYPE);
          }
          // Verify user supplied required input values
          if (!templateData.inputs) {
            return;
          }
          var tplInputs: string[] = _.keys(templateData.inputs);
          if (!tplInputs) {
            return;
          }
          if (typeof inputs === 'undefined') {
            console.error("EntityContainer: missing inputs for template that requires: " + tplInputs.join(', '));
            return reject(EntityError.INPUT_NAME);
          }

          var verifyInput = (type: string, name: string): Promise<void> => {
            return new Promise<void>((resolve, reject) => {
              return this._fetchImportModule(type)
                .then((inputType: any) => {
                  if (typeof inputs[name] === 'undefined') {
                    console.error("EntityContainer: missing input with name: " + name);
                    reject(EntityError.INPUT_NAME);
                  }
                  // Match using instanceof if the inputType was found
                  else if (inputType && !(inputs[name] instanceof inputType)) {
                    console.error("EntityContainer: bad input type for input: " + name);
                    reject(EntityError.INPUT_TYPE);
                  }
                  resolve(inputType);
                }).catch(() => {
                  // Match using typeof as a last resort
                  if (!this.typeofCompare(inputs[name], type)) {
                    console.error("EntityContainer: bad input type for input (" + name + ") expected (" + type + ") but got (" + typeof inputs[name] + ")");
                    reject(EntityError.INPUT_TYPE);
                  }
                  resolve();
                });
            });
          };
          return Promise.all<void>(_.map(templateData.inputs, verifyInput)).catch((e) => reject(e));
        })
        .then(() => {
          if (templateData.components) {
            var keys: string[] = _.map(templateData.components, (c: any)=> {
              return c.name;
            });
            var unique: boolean = _.uniq(keys).length === keys.length;
            if (!unique) {
              console.error("EntityContainer: duplicate name in template components: " + keys.join(', '));
              return reject(EntityError.COMPONENT_NAME_DUPLICATE);
            }
          }
        })
        .then(() => {
          return Promise.all<any[]>(_.map(templateData.components, (c: any) => this._fetchImportModule(c.type)))
            .then(() => {
              var unsatisfied: EntityError = EntityError.NONE;
              _.each(templateData.components, (comp: any) => {
                if (comp.params) {
                  _.each(comp.params, (i: string) => {
                    if (typeof inputs[i] === 'undefined') {
                      console.error("EntityContainer: missing component param: " + i);
                      unsatisfied |= EntityError.COMPONENT_INPUT;
                    }
                  });
                }
              });
              if (unsatisfied !== EntityError.NONE) {
                reject(unsatisfied);
              }
            })
            .catch(() => reject(EntityError.COMPONENT_TYPE));
        })
        .then(() => resolve());
    });
  }

  getTemplate(templateName: string): IEntityTemplate {
    if (!this.data) {
      return null;
    }
    // Valid template name.
    var tpl: any = _.where(this.data, {name: templateName})[0];
    if (!tpl) {
      return null;
    }
    return tpl;
  }


  constructObject(constructor, argArray): any {
    var args = [null].concat(argArray);
    var factoryFunction = constructor.bind.apply(constructor, args);
    return new factoryFunction();
  }


  /**
   * Do a case-insensitive typeof compare to allow generally simpler
   * type specifications in entity files.
   * @param type The type
   * @param expected The expected typeof result
   * @returns {boolean} True if the expected type matches the type
   */
  typeofCompare(type: any, expected: string): boolean {
    var typeString: string = typeof type;
    var expected: string = '' + expected;
    return typeString.toUpperCase() === expected.toUpperCase();
  }

  private _fetchImportModule(importTuple: string): Promise<any> {
    var tuple = importTuple.split(EntityContainerResource.IMPORT_SPLITTER);
    if (tuple.length !== 2) {
      return Promise.reject('import type (' + importTuple + ') must be of format "path|typename"');
    }
    var importName = tuple[0];
    var importType = tuple[1];
    return new Promise<any>((resolve, reject) => {
      const promise = System.import(importName);
      promise.then((importModule: any) => {
        if (!importModule[importType]) {
          reject("INVALID MODULE TYPE: " + importName);
        }
        EntityContainerResource._typesCache[importTuple] = importModule[importType];
        resolve(importModule[importType])
      }).catch((e) => {
        reject("INVALID MODULE: " + importName + ' - ' + e);
      });

    });
  }

  /**
   * Type cache for quick look up of imported es6 modules as entity types
   * @private
   */
  static _typesCache: {
    [fullType: string]: Function
  } = {};


}
