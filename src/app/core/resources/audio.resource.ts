import * as _ from 'underscore';
import { assertTrue } from '../../models/util';
import { errors } from '../errors';
import { Resource } from '../resource';
import { Time } from '../time';

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
  private static FORMATS: [string, string[]][] = [
    ['wav', ['audio/wav;']],
    ['mp3', ['audio/mpeg;']],
    ['m4a', ['audio/x-m4a;']],
    ['aac', ['audio/mp4a;', 'audio/mp4;']],
    ['ogg', ['audio/ogg; codecs="vorbis"']],
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
    if (AudioResource._types.length === 0) {
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
                  type,
                });
              }
            });
          });
        } catch (e) {
          // Fall through
        }
      }
    }
    return this._types.slice();
  }

  private static _context: any = null;

  private static _types: IAudioFormat[] = [];
  private _audio: HTMLAudioElement | null = null;

  fetch(url?: string): Promise<Resource> {
    this.url = url || this.url;
    let formats: IAudioFormat[] = AudioResource.supportedFormats();
    assertTrue(this.url, `AudioResource.load - invalid url :${url}`);
    const extension = this.url.substring(this.url.lastIndexOf('.') + 1);
    const validFormat = formats.find((f) => f.extension === extension);
    if (!validFormat) {
      return Promise.reject(errors.UNSUPPORTED_OPERATION);
    }
    return this._loadAudioElement(validFormat);
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

  private _loadAudioElement(format: IAudioFormat): Promise<AudioResource> {
    return new Promise<AudioResource>((resolve, reject) => {
      const src = this.url;
      assertTrue(src, 'invalid url');
      let completed: () => void = () => {};
      const reference: HTMLAudioElement = document.createElement('audio');
      let timer = new Time().start().addObject({
        tick: () => (reference.readyState > 3 ? completed() : null),
      });
      completed = () => {
        this.data = reference;
        this._audio = reference;
        timer.stop();
        resolve(this);
      };
      reference.addEventListener('canplaythrough', completed);
      const source = document.createElement('source') as HTMLSourceElement;
      source.addEventListener('error', () => {
        console.log(`source failed: ${source.src}`);
        reject(source.src);
      });

      source.type = format.type.substr(0, format.type.indexOf(';'));
      source.src = src;
      reference.appendChild(source);

      reference.load();
    });
  }
}
