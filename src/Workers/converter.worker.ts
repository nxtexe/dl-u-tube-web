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
    log: true,
    progress: ({ratio}) => postMessage<ConverterWorkerProgress>({type: "progress", progress: ratio})
});

interface VideoData {
    videoBuffer: ArrayBuffer;
    name: string;
}
onmessage = async (event: MessageEvent<VideoData>) => {
    try {
        const {videoBuffer, name} = event.data;

        if (!ffmpeg.isLoaded()) {
            await ffmpeg.load();
        }

        ffmpeg.FS('writeFile', `${name}.mp4`, new Uint8Array(videoBuffer));
        await ffmpeg.run('-i', `${name}.mp4`, `${name}.mp3`);
        const data = ffmpeg.FS('readFile', `${name}.mp3`);

        postMessage<ConverterWorkerResult>({audioBuffer: data.buffer, type: "result"}, [data.buffer]);
    } catch (e) {
        postMessage<ConverterWorkerError>({type: "error", error: e as Error});
    }
}