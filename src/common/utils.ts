export function getPWADisplayMode() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (document.referrer.startsWith('android-app://')) {
    return 'twa';
  } else if ((navigator as any).standalone || isStandalone) {
    return 'standalone';
  }
  return 'browser';
}
export function iOS() : boolean {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

export function clamp(num: number, min: number, max: number) {
  return num < min ? min : num > max ? max : num;
}

export function getClipboardText(): Promise<string> {
  return new Promise((resolve, reject) => {
    navigator.clipboard.readText()
    .then(clipText => {
        resolve(clipText);
    })
    .catch((e) => {
      reject(e);
    })
  });
}

export function isYTURL(url: string) { // checks if given URI string is a youtube link
  return /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/.test(url);
}

export function toggleTicker(ref: HTMLElement, parent: HTMLElement) {
  if (parent.classList.contains('playing')) {
    if (parent.childElementCount > 1) {
      parent.removeChild(parent.children[1]);
    }
    ref.getAnimations().forEach(animation => animation.cancel());
    ref.animate([{transform: 'translate(0, 0)'}], {duration: 0, fill: 'forwards'});
    parent.classList.remove('playing');
    parent.style.justifyContent = 'flex-end';

    return;
  }


  if (ref.clientWidth < parent.clientWidth) return;
  parent.style.justifyContent = 'unset';
  let playing = false;
  const title1 = ref;
  const title2 = ref.cloneNode(true) as HTMLElement;
  function play() {
    if (parent) {
      parent.appendChild(title2);
      parent.classList.add('playing');
      const titleWidth = title2.getBoundingClientRect().width;
      const width = parent.getBoundingClientRect().width;
      const margin = titleWidth > width ? 0 : width - titleWidth;
      const overflow = titleWidth > width ? titleWidth - width : 0;
      title2.style.paddingLeft = `${margin}px`;
      title2.style.marginLeft = '0';
      const duration = 10000 * (titleWidth / width);
      const startDuration = (titleWidth / (width + titleWidth + overflow)) * duration;
      function animate() {
        let animated;
        const delay = playing ? duration * 0.1 : startDuration * 0.9;
        if (playing) {
          animated = title1.animate([
            {transform: `translateX(${width}px)`},
            {transform: `translateX(-${width + titleWidth + overflow}px)`}
          ], {duration: duration, fill: 'forwards'});
        } else {
          animated = title1.animate([
            {transform: 'translateX(5px)'},
            {transform: 'translateX(-100%)'}
          ], {duration: startDuration, fill: 'forwards'});
          playing = true;
        }
        title2.animate([
          {transform: `translateX(${width}px)`},
          {transform: `translateX(-${width + titleWidth + overflow}px)`}
        ], {duration: duration, delay: delay, fill: 'forwards'});
        animated.onfinish = window.requestAnimationFrame.bind(null, animate);
      }
  
      animate();
    }
  }

  play();
}

export function formatFromDuration(duration : number) {
  return duration < 3600 ? duration < 600 ? 'm:ss' : 'mm:ss' : 'h:mm:ss';
}

export function downloadFile(url: string, filename: string) {
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export function getFileRaw(blobOrFile: File | Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = (e) => reject(e);
    reader.onload = function () {
      if (reader.result && typeof reader.result !== "string") {
        resolve(reader.result);
      } else {
        reject();
      }
    }

    reader.readAsArrayBuffer(blobOrFile);
  });
}

export function fetchImage(url: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    fetch(`/api/proxy/image?url=${encodeURIComponent(url)}`)
    .then(response => response.blob())
    .then(blob => {
      console.log(blob);
      resolve(blob);
    })
    .catch(e => {
      console.error(e);
      reject(e);
    });
  });
}