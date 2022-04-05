export const downloader = new Worker(new URL('./downloader.ts', import.meta.url));
export const converter = new Worker(new URL('./video-to-audio.ts', import.meta.url), {type: "module"});

console.log("Workers attached");