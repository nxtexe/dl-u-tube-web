import {
    ConverterWorkerResult,
    ConverterWorkerError,
    ConverterWorkerProgress
} from '../Workers/converter.worker';

type ConverterWorkerEvent = ConverterWorkerResult | ConverterWorkerProgress | ConverterWorkerError;

export default class Converter {
    private static _instance: Converter | null = null;
    private worker: Worker = new Worker(new URL('../Workers/converter.worker.ts', import.meta.url), {type: "module"});
    private _onProgress: Function | null = null;
    private constructor() {}

    static get instance(): Converter {
        if (!Converter._instance) {
            Converter._instance = new Converter();
        }

        return Converter._instance;
    }

    set onProgress(_onProgress: Function) {
        this._onProgress = _onProgress;
    }

    mp4ToMp3(videoBuffer: ArrayBuffer, name: string): Promise<ArrayBuffer> {
        this.worker.postMessage({videoBuffer, name}, [videoBuffer]);

        // TODO file validation
        return new Promise((resolve, reject) => {
            this.worker.onmessage = (event: MessageEvent<ConverterWorkerEvent>) => {
                switch(event.data.type) {
                    case "result":
                        resolve(event.data.audioBuffer);
                        break;
                    
                    case "error":
                        reject(event.data.error);
                        break;
                    
                    case "progress":
                        if (this._onProgress) this._onProgress(event.data.progress);
                        break;
                    
                    default:
                        reject(new Error("Unhandled worker event"));
                }
            }
        });
    }
}