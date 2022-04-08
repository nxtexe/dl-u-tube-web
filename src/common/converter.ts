import {
    ConverterWorkerResult,
    ConverterWorkerError,
    ConverterWorkerProgress
} from '../Workers/converter.worker';
import {v4 as uuid4} from 'uuid';

type ConverterWorkerEvent = ConverterWorkerResult | ConverterWorkerProgress | ConverterWorkerError;

interface WorkerInstance {
    worker: Worker;
    busy: boolean;
    id: string;
    timeoutID: number; // if worker not in use then a timer will be set to terminate worker
    resourceID: string | null; // underlying resource being downloaded
}

interface ConversionEnd {
    workerID: string;
}

type ConversionProgressHandler = ((resourceID: string, progress: number)=>void) | null;
type Resolver = (value: ArrayBuffer | PromiseLike<ArrayBuffer>) => void;
type Rejecter = (reason?: any) => void;

export interface ConversionProgress {
    resourceID: string;
    progress: number;
}

export default class Converter {
    private static _instance: Converter | null = null;
    private _onProgress: ConversionProgressHandler = null;
    private workerPool: Map<string, WorkerInstance> = new Map();
    private maxWorkers = navigator.hardwareConcurrency || 2;

    private constructor() {}

    static get instance(): Converter {
        if (!Converter._instance) {
            Converter._instance = new Converter();
        }

        return Converter._instance;
    }

    set onProgress(_onProgress: ConversionProgressHandler) {
        this._onProgress = _onProgress;
    }

    mp4ToMp3(resourceID: string, videoBuffer: ArrayBuffer, name: string): Promise<ArrayBuffer> {
        // TODO file validation
        return new Promise((resolve, reject) => {
            const intervalID = window.setInterval(async () => {
                const workerInstance = await this.spawnWorker(resourceID);
                if (!workerInstance.busy) {
                    workerInstance.worker.postMessage({videoBuffer, name, inType: 'mp4', outType: 'mp3'}, [videoBuffer]);
                    workerInstance.busy = true;
                    workerInstance.worker.onmessage = (event: MessageEvent<ConverterWorkerEvent>) => {
                        this.onMessage(event, workerInstance.id, resolve, reject);
                    };
                    clearInterval(intervalID);
                }
            }, 3000);
        });
    }

    private onMessage(event: MessageEvent<ConverterWorkerEvent>, id: string, resolve: Resolver, reject: Rejecter) {
        const workerInstance = this.workerPool.get(id);
        if (!workerInstance || !workerInstance.resourceID) return;
        switch(event.data.type) {
            case "result":
                // thread is free
                workerInstance.busy = false;
                // after 1s idle cleanup worker
                workerInstance.timeoutID = window.setTimeout(() => {
                    if (this.workerPool.size > 1) {// always leave at least one thread idle
                        workerInstance.worker.terminate();
                        this.workerPool.delete(id);                    
                        window.GLOBAL_WORKER_POOL_SIZE--;
                    }
                    
                }, 1000);
                 

                const conversionend = new CustomEvent<ConversionEnd>('conversionend', {
                    detail: {workerID: id}
                });
                window.dispatchEvent(conversionend);

                resolve(event.data.audioBuffer);
                break;
            
            case "error":
                reject(event.data.error);
                break;
            
            case "progress":
                if (this._onProgress) this._onProgress(workerInstance.resourceID, event.data.progress);
                break;
            
            default:
                reject(new Error("Unhandled Worker Event"));
        }
    }

    private spawnWorker(resourceID: string): Promise<WorkerInstance> {
        return new Promise((resolve, reject) => {
            let workerInstance: WorkerInstance | null = null;
            for (const _workerInstance of this.workerPool.values()) {
                workerInstance = _workerInstance;
                if (!workerInstance.busy) {
                    if (workerInstance.timeoutID) window.clearTimeout(workerInstance.timeoutID);
                    workerInstance.resourceID = resourceID;
                    resolve(workerInstance); // free thread found; resolve
                    break;
                } else {
                    workerInstance = null;
                    continue;
                }
            }

            if (!workerInstance) {
                if (this.workerPool.size < this.maxWorkers - window.GLOBAL_WORKER_POOL_SIZE) {
                    const _id = uuid4();
                    workerInstance = {
                        id: _id,
                        worker: new Worker(new URL('../Workers/converter.worker.ts', import.meta.url)),
                        busy: false,
                        timeoutID: 0,
                        resourceID
                    }; // no free threads were found; spawn new thread
                    this.workerPool.set(_id, workerInstance);
                    window.GLOBAL_WORKER_POOL_SIZE++;
                    resolve(workerInstance);
                } else {
                    // wait until a worker is available
                    const controller = new AbortController(); 
    
                    window.addEventListener('conversionend', ((e: CustomEvent<ConversionEnd>) => {
                        const workerInstance = this.workerPool.get(e.detail.workerID);
    
                        if (workerInstance && !workerInstance.busy) {
                            clearTimeout(workerInstance.timeoutID);
                            workerInstance.resourceID = resourceID;
                            resolve(workerInstance);
                            controller.abort();
                        }
                    }) as EventListener, {signal: controller.signal});
                }
            }
        });
    }
}