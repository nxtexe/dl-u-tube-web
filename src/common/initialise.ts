export function update() {
    navigator.serviceWorker.ready.then((registration) => {
        registration.update();
    });
}
export default function initialise() {
    // initialise the app
    
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(new URL('../Workers/service.worker.ts', import.meta.url), {
            type: "module",
            scope: '/'
        });
    }, {once: true});
    
}