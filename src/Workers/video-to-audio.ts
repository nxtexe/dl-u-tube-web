import { createFFmpeg } from "@ffmpeg/ffmpeg";

declare function postMessage(message: any, transfer?: Transferable[]): void;

const ffmpeg = createFFmpeg({
    log: true
});


interface VideoData {
    videoBuffer: ArrayBuffer;
    name: string;
}

onmessage = async (event: MessageEvent<VideoData>) => {
    const {videoBuffer, name} = event.data;

    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
    }

    ffmpeg.FS('writeFile', `${name}.mp4`, new Uint8Array(videoBuffer));
    await ffmpeg.run('-i', `${name}.mp4`, `${name}.mp3`);
    const data = ffmpeg.FS('readFile', `${name}.mp3`);

    postMessage(data.buffer, [data.buffer]);
}