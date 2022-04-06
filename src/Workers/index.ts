export const downloader = new Worker(new URL('./downloader.ts', import.meta.url));

console.log("Workers attached");