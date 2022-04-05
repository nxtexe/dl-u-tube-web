export {};

interface VideoInfo {
    url: string;
    contentLength: number;
}

onmessage = (event: MessageEvent<VideoInfo>) => {
    const {data} = event;
    fetch(`/api/video?url=${encodeURI(data.url)}`)
    .then(response => {
        if (!response.body) return;
        const reader = response.body.getReader();
        return new ReadableStream<Uint8Array>({
            start(controller) {
                async function push() {
                    const {done, value} = await reader.read();
                    if (done) {
                        controller.close();
                        return;
                    } else {
                        controller.enqueue(value);
                    }
                    
                    push();
                }

                push();
            }
        })
    })
    .then(stream => new Response(stream).blob())
    .then(blob => postMessage(blob))
    .catch(e => {
        fetch(`/api/${(e as any).message}`);
        console.error(e);
    });
}