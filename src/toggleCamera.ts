const video = document.createElement("video") as HTMLVideoElement;

export default function toggleCamera(cnv: HTMLCanvasElement) {
    const ctx = cnv.getContext("2d");
    if (!video.paused) {
        const stream = video.srcObject as MediaStream;
        if (stream === null) {
            return;
        }
        const tracks = stream.getTracks();

        if (ctx && tracks?.length > 0) {
            video.pause();
            video.currentTime = 0;
            tracks.forEach(track => {
                track.stop();
                stream.removeTrack(track)
            });
            ctx.clearRect(0, 0, cnv.width, cnv.height);

            return;
        }
    }
    const videoObj = navigator.getUserMedia ||
        (navigator as any).mozGetUserMedia ?
        {
            video: {
                width: { min: cnv.width, max: cnv.width },
                height: { min: cnv.height, max: cnv.height },
                require: ['width', 'height']
            }
        } :
        {
            video: {
                mandatory: {
                    minWidth: cnv.width,
                    minHeight: cnv.height,
                    maxWidth: cnv.width,
                    maxHeight: cnv.height,
                }
            }
        };
    const errBack = function (e: MediaStreamError) {
        console.log(e.message);
    };
    let rafId: number;

    navigator.getUserMedia = navigator.getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia;
    navigator.getUserMedia(videoObj, function (stream) {
        video.srcObject = stream;
        video.onplaying = function () {
            rafId = requestAnimationFrame(loop);
        };
        video.onpause = function () {
            cancelAnimationFrame(rafId);
        }
        video.play();
    }, errBack);

    function loop() {
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, cnv.width, cnv.height, 0, 0, cnv.width, cnv.height);
        rafId = requestAnimationFrame(loop);
    }
}