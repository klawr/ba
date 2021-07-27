
const prvs = new cv.Mat();

// parameters for ShiTomasi corner detection
const [maxCorners, qualityLevel, minDistance, blockSize] = [30, 0.3, 7, 7];

// parameters for lucas kanade optical flow
const winSize = new cv.Size(15, 15);
const maxLevel = 2;
const criteria = new cv.TermCriteria(cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 10, 0.03);

// create some random colors
const color = [];
for (let i = 0; i < maxCorners; i++) {
    color.push(new cv.Scalar(parseInt(Math.random() * 255), parseInt(Math.random() * 255),
        parseInt(Math.random() * 255), 255));
}

let step_opencv_lucas_kanade_first_indicator = false;
const oldGray = new cv.Mat();
let p0 = new cv.Mat();
const none = new cv.Mat();

// Create a mask image for drawing purposes
const zeroEle = new cv.Scalar(0, 0, 0, 255);
const mask = new cv.Mat(cnv_height, cnv_width, cv.CV_8UC4, zeroEle);

const frame = new cv.Mat(cnv_height, cnv_width, cv.CV_8UC4);
const frameGray = new cv.Mat();
const p1 = new cv.Mat();
const st = new cv.Mat();
const err = new cv.Mat();

function step_opencv_lucas_kanade(fn) {
    const frame = cv.imread(cnv1);
    if (!step_opencv_lucas_kanade_first_indicator) {
        // take first frame and find corners in it
        cv.cvtColor(frame, oldGray, cv.COLOR_RGB2GRAY);
        cv.goodFeaturesToTrack(oldGray, p0, maxCorners, qualityLevel, minDistance, none, blockSize);
        g.exe(ctx1);
        step_opencv_lucas_kanade_first_indicator = false;
    }

    cv.cvtColor(frame, frameGray, cv.COLOR_RGBA2GRAY);
    
    model.tick(1 / 60);
    g.exe(ctx1);

    // calculate optical flow
    cv.calcOpticalFlowPyrLK(oldGray, frameGray, p0, p1, st, err, winSize, maxLevel, criteria);

    // select good points
    const goodNew = [];
    const goodOld = [];
    for (let i = 0; i < st.rows; i++) {
        if (st.data[i] === 1) {
            goodNew.push(new cv.Point(p1.data32F[i * 2], p1.data32F[i * 2 + 1]));
            goodOld.push(new cv.Point(p0.data32F[i * 2], p0.data32F[i * 2 + 1]));
        }
    }

    // draw the tracks
    for (let i = 0; i < goodNew.length; i++) {
        cv.line(mask, goodNew[i], goodOld[i], color[i], 2);
        cv.circle(frame, goodNew[i], 5, color[i], -1);
    }
    cv.add(frame, mask, frame);
    cv.imshow(ctx2.canvas, frame);

    // now update the previous frame and previous points
    frameGray.copyTo(oldGray);
    p0 = new cv.Mat(goodNew.length, 1, cv.CV_32FC2);
    for (let i = 0; i < goodNew.length; i++) {
        p0.data32F[i * 2] = goodNew[i].x;
        p0.data32F[i * 2 + 1] = goodNew[i].y;
    }

    fn?.call();

    if (running) {
        rafId = requestAnimationFrame(() => step_opencv_lucas_kanade(fn));  // keep calling back
    }
}
