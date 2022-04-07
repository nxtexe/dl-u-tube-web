export interface DownloaderWorkerResult {
    type: "result";
    videoBuffer: ArrayBuffer;
}

export interface DownloaderWorkerProgress {
    type: "progress";
    progress: number;
}

export interface DownloaderWorkerError {
    type: "error";
    error: Error;
}

interface VideoInfo {
    url: string;
    contentLength: number;
}

declare function postMessage(message: any, transfer?: Transferable[]): void;
declare function postMessage<T>(message: T, transfer?: Transferable[]): void;

onmessage = (event: MessageEvent<VideoInfo>) => {
    const {url, contentLength} = event.data;
    fetch(`/api/video?url=${encodeURI(url)}`)
    .then(response => {
        if (!response.body) return;
        const reader = response.body.getReader();
        let downloadedLength = 0;
        return new ReadableStream<Uint8Array>({
            start(controller) {
                async function push() {
                    const {done, value} = await reader.read();
                    if (done) {
                        controller.close();
                        return;
                    } else {
                        downloadedLength += value.length;
                        const progress = downloadedLength / contentLength;
                        postMessage<DownloaderWorkerProgress>({progress, type: "progress"});
                        controller.enqueue(value);
                    }
                    
                    push();
                }

                push();
            }
        });
    })
    .then(stream => new Response(stream).arrayBuffer())
    .then(videoBuffer => postMessage<DownloaderWorkerResult>({videoBuffer, type: "result"}, [videoBuffer]))
    .catch(e => {
        postMessage<DownloaderWorkerError>({error: e, type: "error"});
    });
}