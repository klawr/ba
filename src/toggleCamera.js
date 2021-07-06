const canvas_video_element = document.createElement("video");

function toggleCamera(cnv, fn) {
    const ctx = cnv.getContext("2d");
    if (!canvas_video_element.paused) {
        const stream = canvas_video_element.srcObject;
        if (stream === null) {
            return;
        }
        const tracks = stream.getTracks();

        if (ctx && tracks?.length > 0) {
            canvas_video_element.pause();
            canvas_video_element.currentTime = 0;
            tracks.forEach(track => {
                track.stop();
                stream.removeTrack(track)
            });
            ctx.clearRect(0, 0, cnv.width, cnv.height);

            return;
        }
    }
    const videoObj = navigator.getUserMedia ||
        navigator.mozGetUserMedia ?
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
    const errBack = function (e) {
        console.log(e.message);
    };
    let rafId;

    navigator.getUserMedia = navigator.getUserMedia ||
        (navigator).webkitGetUserMedia ||
        (navigator).mozGetUserMedia;
    navigator.getUserMedia(videoObj, function (stream) {
        canvas_video_element.srcObject = stream;
        canvas_video_element.onplaying = function () {
            rafId = requestAnimationFrame(loop);
        };
        canvas_video_element.onpause = function () {
            cancelAnimationFrame(rafId);
        }
        canvas_video_element.play();
    }, errBack);

    function loop() {
        if (fn) fn();
        if (!ctx) return;
        ctx.drawImage(canvas_video_element, 0, 0, cnv.width, cnv.height, 0, 0, cnv.width, cnv.height);
        rafId = requestAnimationFrame(loop);
    }
}