
const tmp = new cv.Mat();

const prvs = new cv.Mat();

const magLimit = new cv.Mat(cnv_height, cnv_width, cv.CV_32FC1, new cv.Scalar(5));

const hsv = new cv.Mat();
const hsv0 = new cv.Mat(cnv_height, cnv_width, cv.CV_8UC1);
const hsv1 = new cv.Mat(cnv_height, cnv_width, cv.CV_8UC1, new cv.Scalar(255));
const hsv2 = new cv.Mat(cnv_height, cnv_width, cv.CV_8UC1);
const hsvVec = new cv.MatVector();
hsvVec.push_back(hsv0);
hsvVec.push_back(hsv1);
hsvVec.push_back(hsv2);

const next = new cv.Mat(cnv_height, cnv_width, cv.CV_8UC1);

const flow = new cv.Mat(cnv_height, cnv_width, cv.CV_32FC2);
const flowVec = new cv.MatVector();

const mag = new cv.Mat(cnv_height, cnv_width, cv.CV_32FC1);
const ang = new cv.Mat(cnv_height, cnv_width, cv.CV_32FC1);
const rgb = new cv.Mat(cnv_height, cnv_width, cv.CV_8UC3);

function step_opencv(fn) {
    const frame1 = cv.imread(cnv1);
    cv.cvtColor(frame1, prvs, cv.COLOR_RGBA2GRAY);
    frame1.delete();

    model.tick(1 / 60);
    g.exe(ctx1);
    const frame2 = cv.imread(cnv1);
    cv.cvtColor(frame2, next, cv.COLOR_RGBA2GRAY);
    frame2.delete();

    cv.calcOpticalFlowFarneback(prvs, next, flow,
        0.5, // pyr_scale
        2, // levels
        3, // winsize
        3, // iterations
        1, // poly_n
        1.2, // poly_sigma
        0); // flags
    cv.split(flow, flowVec);
    const u = flowVec.get(0);
    const v = flowVec.get(1);
    cv.cartToPolar(u, v, mag, ang);
    u.delete();
    v.delete();
    
    ang.convertTo(hsv0, cv.CV_8UC1, 180 / Math.PI / 2);

    cv.min(mag, magLimit, mag);
    cv.normalize(mag, hsv2, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);

    cv.merge(hsvVec, hsv);
    cv.cvtColor(hsv, rgb, cv.COLOR_HSV2RGB);
    cv.imshow(ctx2.canvas, rgb);

    fn?.call();

    if (running) {
        rafId = requestAnimationFrame(() => step_opencv(fn));  // keep calling back
    }
}
