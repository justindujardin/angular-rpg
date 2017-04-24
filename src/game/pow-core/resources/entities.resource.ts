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
import {BehaviorHost} from '../behavior-host';
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
  [name: string]: Function;
}

/**
 * The basic description of an object that may be instantiated with custom constructor
 * arguments.
 */
export interface IEntityObject {
  /**
   * The name of the entity to use when creating.
   */
  name?: string;
  /**
   * The object type to use for the entity.  Assumed to be an [[ISceneObjectComponentHost]] type.
   */
    type: Function;
  /**
   * An array of inputs for the constructor call to the output object of `type`.
   */
  params?: string[];
}

/**
 * A composite entity template that describes the inputs and outputs of
 * an entity that may be instantiated.
 */
export interface IEntityTemplate extends IEntityObject {

  /**
   * A map of named inputs and their types.
   */
  inputs?: IEntityInputsMap;

  /**
   * A map of named inputs and their types.
   */
  depends?: Function[];

  /**
   * An array of map to instantiate and add to the output container.
   */
  components: IEntityObject[];
}

export class EntityFactory {

  constructor(public data: IEntityTemplate[]) {

  }

  /**
   * Instantiate an object and set of map from a given template.
   * @param templateName The name of the template in the resource.
   * @param inputs An object of input values to use when instantiating objects and map.
   * @returns {*} The resulting object or null
   */
  createObject(templateName: string, inputs?: any): Promise<any> {
    // Valid template name.
    let tpl: IEntityTemplate = this.getTemplate(templateName);
    if (!tpl) {
      return Promise.reject('invalid template');
    }

    return this
      .validateTemplate(tpl, inputs)
      .then(() => {
        const type = tpl.type;
        // Create entity object
        //
        // If inputs.params are specified use them explicitly, otherwise pass the inputs
        // dire
        const inputValues: any[] = tpl.params ? _.map(tpl.params, (n: string) => {
            return inputs[n];
          }) : [inputs];

        const object: BehaviorHost = this.constructObject(type, inputValues);

        return Promise.all(_.map(tpl.components, (comp: IEntityObject) => {
          return new Promise<void>((resolve, reject) => {
            const compInputs: any[] = _.map(comp.params || [], (n: string) => {
              return inputs[n];
            });
            const ctor = comp.type;
            let compObject = null;
            try {
              compObject = this.constructObject(ctor, compInputs);
            }
            catch (e) {
              console.error(e);
              reject('Failed to construct component with error' + e);
            }
            compObject.name = comp.name;
            if (!object.addBehavior(compObject)) {
              reject(errors.COMPONENT_REGISTER_FAIL);
            }
            resolve(compObject);
          });
        })).then(() => object).catch((e) => {
          console.warn('failed to create entity with error: ' + e);
          return null;
        });
      });
  }

  /**
   * Validate a template object's correctness, returning a string
   * error if incorrect, or null if correct.
   *
   * @param templateData The template to verify
   * @param inputs
   */
  validateTemplate(templateData: IEntityTemplate, inputs?: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const type = templateData.type;
      if (!type) {
        return reject(EntityError.ENTITY_TYPE);
      }
      // Verify user supplied required input values
      if (!templateData.inputs) {
        return;
      }
      let tplInputs: string[] = _.keys(templateData.inputs);
      if (!tplInputs) {
        return;
      }
      if (typeof inputs === 'undefined') {
        console.error(`EntityContainer: missing inputs for template that requires: ${tplInputs.join(', ')}`);
        return reject(EntityError.INPUT_NAME);
      }

      // Async input validation
      const verifyInput = (inputType: any, name: string): Promise<any> => {
        return new Promise<void>((resolveInput, rejectInput) => {
          if (typeof inputs[name] === 'undefined') {
            console.error(`EntityContainer: missing input with name: ${name}`);
            rejectInput(EntityError.INPUT_NAME);
          }
          // Match using instanceof if the inputType was found
          else if (inputType && !(inputs[name] instanceof inputType)) {
            console.error(`EntityContainer: bad input type for input: ${name}`);
            rejectInput(EntityError.INPUT_TYPE);
          }
          else {
            resolveInput();
          }
        });
      };
      return Promise.all<void>(_.map(templateData.inputs, verifyInput))
        .then(() => {
          if (templateData.components) {
            const keys: string[] = _.map(templateData.components, (c: any) => {
              return c.name;
            });
            let unique: boolean = _.uniq(keys).length === keys.length;
            if (!unique) {
              console.error(`EntityContainer: duplicate name in template components: ${keys.join(', ')}`);
              return Promise.reject(EntityError.COMPONENT_NAME_DUPLICATE);
            }
          }
        })
        .then(() => {
          let unsatisfied: EntityError = EntityError.NONE;
          _.each(templateData.components, (comp: any) => {
            if (comp.params) {
              _.each(comp.params, (i: string) => {
                if (typeof inputs[i] === 'undefined') {
                  console.error(`EntityContainer: missing component param: ${i}`);
                  unsatisfied = EntityError.COMPONENT_INPUT;
                }
              });
            }
          });
          if (unsatisfied !== EntityError.NONE) {
            return Promise.reject(unsatisfied);
          }
        })
        .then(() => resolve())
        .catch((e) => reject(e));
    });
  }

  getTemplate(templateName: string): IEntityTemplate {
    if (!this.data) {
      return null;
    }
    // Valid template name.
    let tpl: any = _.where(this.data, {name: templateName})[0];
    if (!tpl) {
      return null;
    }
    return tpl;
  }

  constructObject(constructor, argArray): any {
    const args = [null].concat(argArray);
    const factoryFunction = constructor.bind.apply(constructor, args);
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
    const typeString: string = typeof type;
    return typeString.toUpperCase() === ('' + expected).toUpperCase();
  }

}
