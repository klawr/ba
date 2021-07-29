
const gtv = global_test_variables;

const global_gruppe2_variables = {
    tmp: new cv.Mat(),
    prvs: new cv.Mat(),
    magLimit: new cv.Mat(gtv.cnv_height, gtv.cnv_width, cv.CV_32FC1, new cv.Scalar(5)),

    hsv: new cv.Mat(),
    hsv0: new cv.Mat(gtv.cnv_height, gtv.cnv_width, cv.CV_8UC1),
    hsv1: new cv.Mat(gtv.cnv_height, gtv.cnv_width, cv.CV_8UC1, new cv.Scalar(255)),
    hsv2: new cv.Mat(gtv.cnv_height, gtv.cnv_width, cv.CV_8UC1),
    hsvVec: new cv.MatVector(),
    next: new cv.Mat(gtv.cnv_height, gtv.cnv_width, cv.CV_8UC1),
    flow: new cv.Mat(gtv.cnv_height, gtv.cnv_width, cv.CV_32FC2),
    flowVec: new cv.MatVector(),
    mag: new cv.Mat(gtv.cnv_height, gtv.cnv_width, cv.CV_32FC1),
    ang: new cv.Mat(gtv.cnv_height, gtv.cnv_width, cv.CV_32FC1),
    rgb: new cv.Mat(gtv.cnv_height, gtv.cnv_width, cv.CV_8UC3),
}

global_gruppe2_variables.hsvVec.push_back(global_gruppe2_variables.hsv0);
global_gruppe2_variables.hsvVec.push_back(global_gruppe2_variables.hsv1);
global_gruppe2_variables.hsvVec.push_back(global_gruppe2_variables.hsv2);

function step_opencv_farneback(fn) {
    const { cnv1, ctx1, ctx2, g, running } = global_test_variables;
    const { prvs, next, flow, flowVec, ang, hsv, hsv0, hsv2, mag, magLimit, hsvVec, rgb } = global_gruppe2_variables;

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
}
