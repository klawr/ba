const gtv = global_test_variables;

const global_gruppe3_variables = {
    // parameters for ShiTomasi corner detection
    maxCorners: 30,
    qualityLevel: 0.3,
    minDistance: 7,
    blockSize: 7,

    // parameters for lucas kanade optical flow
    winSize: new cv.Size(15, 15),
    maxLevel: 2,
    criteria: new cv.TermCriteria(cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 10, 0.03),


    init() {
        this.first_indicator = false;

        ["prvs", "oldGray", "p0", "none", "frameGray", "p1", "st", "err"].forEach(k => {
            this[k] && this[k].delete();
            this[k] = new cv.Mat();
        });

        // Create a mask image for drawing purposes
        this.mask && this.mask.delete();
        this.mask = new cv.Mat(gtv.cnv_height, gtv.cnv_width, cv.CV_8UC4, new cv.Scalar(0, 0, 0, 255));


        this.color = []
        // create some random colors
        for (let i = 0; i < global_gruppe3_variables.maxCorners; i++) {
            global_gruppe3_variables.color.push(new cv.Scalar(parseInt(Math.random() * 255), parseInt(Math.random() * 255),
                parseInt(Math.random() * 255), 255));
        }

    }
}

global_gruppe3_variables.init();

global_test_variables.reset = function () {
    global_gruppe3_variables.init();
}

function step_opencv_lucas_kanade(fn) {
    const olk = global_gruppe3_variables;
    const { ctx2 } = global_test_variables;

    const frame = cv.imread(cnv1);
    if (!olk.first_indicator) {
        // take first frame and find corners in it
        cv.cvtColor(frame, olk.oldGray, cv.COLOR_RGB2GRAY);
        cv.goodFeaturesToTrack(olk.oldGray, olk.p0, olk.maxCorners, olk.qualityLevel, olk.minDistance, olk.none, olk.blockSize);
        olk.first_indicator = true;
    }

    cv.cvtColor(frame, olk.frameGray, cv.COLOR_RGBA2GRAY);

    // calculate optical flow
    cv.calcOpticalFlowPyrLK(olk.oldGray, olk.frameGray, olk.p0, olk.p1, olk.st, olk.err, olk.winSize, olk.maxLevel, olk.criteria);

    // select good points
    const goodNew = [];
    const goodOld = [];
    for (let i = 0; i < olk.st.rows; i++) {
        if (olk.st.data[i] === 1) {
            goodNew.push(new cv.Point(olk.p1.data32F[i * 2], olk.p1.data32F[i * 2 + 1]));
            goodOld.push(new cv.Point(olk.p0.data32F[i * 2], olk.p0.data32F[i * 2 + 1]));
        }
    }

    // draw the tracks
    for (let i = 0; i < goodNew.length; i++) {
        cv.line(olk.mask, goodNew[i], goodOld[i], olk.color[i], 2);
        cv.circle(frame, goodNew[i], 5, olk.color[i], -1);
    }
    cv.add(frame, olk.mask, frame);
    cv.imshow(ctx2.canvas, frame);

    // now update the previous frame and previous points
    olk.frameGray.copyTo(olk.oldGray);
    olk.p0 = new cv.Mat(goodNew.length, 1, cv.CV_32FC2);
    for (let i = 0; i < goodNew.length; i++) {
        olk.p0.data32F[i * 2] = goodNew[i].x;
        olk.p0.data32F[i * 2 + 1] = goodNew[i].y;
    }

    fn?.call();
}
