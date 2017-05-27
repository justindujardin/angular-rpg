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
import {Resource} from '../resource';
import {errors} from '../errors';
import {Time} from '../time';
import * as _ from 'underscore';

/**
 * A supported audio format description that maps extensions to resource types.
 */
export interface IAudioFormat {

  /**
   * The file extension that corresponds to this format.
   */
  extension: string;

  /**
   * The media resource type to check against an audio element.
   */
  type: string;
}

/**
 * Define an interface for interacting with audio files.
 */
export interface IAudioSource {
  play(): IAudioSource;
  pause(): IAudioSource;
  volume: number;
}

/**
 * Use jQuery to load an Audio resource.
 */
export class AudioResource extends Resource implements IAudioSource {
  data: HTMLAudioElement;
  private static FORMATS: any[] = [
    ['mp3', ['audio/mpeg;']],
    ['m4a', ['audio/x-m4a;']],
    ['aac', ['audio/mp4a;', 'audio/mp4;']],
    ['ogg', ['audio/ogg; codecs="vorbis"']],
    ['wav', ['audio/wav; codecs="1"']]
  ];

  /**
   * Detect support for audio files of varying types.
   *
   * Source: http://diveintohtml5.info/everything.html
   */
  static supportedFormats(): IAudioFormat[] {
    const w: any = window;
    const ac: any = w.AudioContext || w.webkitAudioContext;
    if (AudioResource._context === null && ac) {
      AudioResource._context = new ac();
    }
    if (AudioResource._types === null) {
      this._types = [];
      const a = document.createElement('audio');
      // The existence of canPlayType indicates support for audio elements.
      if (a.canPlayType) {
        try {
          // Server editions of Windows will throw "Not Implemented" if they
          // have no access to media extension packs.  Catch this error and
          // leave the detected types at 0 length.
          a.canPlayType('audio/wav;');

          _.each(this.FORMATS, (desc) => {
            const types = desc[1];
            const extension = desc[0];
            _.each(types, (type: string) => {
              if (!!a.canPlayType(type)) {
                this._types.push({
                  extension,
                  type
                });
              }
            });
          });
        }
        catch (e) {
          // Fall through
        }
      }

    }
    return this._types.slice();
  }

  private static _context: any = null;

  private static _types: IAudioFormat[] = null;

  private _source: AudioBufferSourceNode = null;
  private _audio: HTMLAudioElement = null;

  fetch(url?: string): Promise<Resource> {
    this.url = url || this.url;
    let formats: IAudioFormat[] = AudioResource.supportedFormats();
    // If the url specifies a format, sort it to the front of the formats
    // list so it will be tried first.
    const dotIndex = this.url.lastIndexOf('.');
    if (dotIndex !== -1) {
      const urlExtension = this.url.substr(dotIndex + 1);
      formats = formats.sort((a: IAudioFormat, b: IAudioFormat) => {
        if (b.extension === urlExtension) {
          return 1;
        }
        return 0;
      });
    }
    if (formats.length === 0) {
      return Promise.reject(errors.UNSUPPORTED_OPERATION);
    }
    return this._loadAudioElement(formats);
  }

  play(when: number = 0): IAudioSource {
    if (this.data) {
      this.data.volume = this.volume;
      this.data.play();
    }
    return this;
  }

  pause(): IAudioSource {
    if (this.data) {
      this.data.pause();
    }
    return this;
  }

  private _volume: number = 0.8;
  set volume(value: number) {
    this._volume = value;
  }

  get volume(): number {
    return this._volume;
  }

  private _getUrlForFormat(format: IAudioFormat): string {
    const index = this.url.lastIndexOf('.');
    let url = this.url;
    if (index !== -1) {
      url = url.substr(0, index);
    }
    return `${url}.${format.extension}`;

  }

  private _loadAudioElement(formats: IAudioFormat[]): Promise<AudioResource> {

    return new Promise<AudioResource>((resolve, reject) => {
      let sources: number = formats.length;
      let completed;
      const invalid: string[] = [];
      const reference: HTMLAudioElement = document.createElement('audio');
      let timer = new Time()
        .start()
        .addObject({
          tick: () => reference.readyState > 3 ? completed() : null
        });
      completed = () => {
        this.data = reference;
        this._audio = reference;
        timer.stop();
        resolve(this);
      };
      const incrementFailure: Function = (path: string) => {
        sources--;
        invalid.push(path);
        if (sources <= 0) {
          reject('No valid sources at the following URLs\n' + invalid.join('\n   '));
        }
      };

      if (sources === 0) {
        return reject('no supported media types');
      }

      reference.addEventListener('canplaythrough', completed);
      // Try all supported types, and accept the first valid one.
      _.each(formats, (format: IAudioFormat) => {
        let source = document.createElement('source') as HTMLSourceElement;
        source.addEventListener('error', () => {
          console.log(`source failed: ${source.src}`);
          incrementFailure(source.src);
        });

        source.type = format.type.substr(0, format.type.indexOf(';'));
        source.src = this._getUrlForFormat(format);
        reference.appendChild(source);
      });

      reference.load();
    });
  }
}
