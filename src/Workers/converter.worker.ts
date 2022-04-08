import { createFFmpeg } from "@ffmpeg/ffmpeg";

export interface ConverterWorkerResult {
    type: "result";
    audioBuffer: ArrayBuffer;
}

export interface ConverterWorkerError {
    type: "error";
    error: Error;
}

export interface ConverterWorkerProgress {
    type: "progress";
    progress: number;
}

declare function postMessage(message: any, transfer?: Transferable[]): void;
declare function postMessage<T>(message: T, transfer?: Transferable[]): void;

const ffmpeg = createFFmpeg({
    log: false,
    progress: ({ratio}) => postMessage<ConverterWorkerProgress>({type: "progress", progress: ratio})
});

export interface VideoData {
    videoBuffer: ArrayBuffer;
    name: string;
    inType: string;
    outType: string;
}

onmessage = async (event: MessageEvent<VideoData>) => {
    try {
        const {videoBuffer, name, inType, outType} = event.data;

        if (!ffmpeg.isLoaded()) {
            await ffmpeg.load();
        }

        ffmpeg.FS('writeFile', `${name}.${inType}`, new Uint8Array(videoBuffer));
        await ffmpeg.run('-i', `${name}.${inType}`, `${name}.${outType}`);
        const data = ffmpeg.FS('readFile', `${name}.${outType}`);

        postMessage<ConverterWorkerResult>({audioBuffer: data.buffer, type: "result"}, [data.buffer]);
    } catch (e) {
        postMessage<ConverterWorkerError>({type: "error", error: e as Error});
    }
}