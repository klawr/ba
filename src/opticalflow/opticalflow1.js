
const sim = simulation;

const globalGruppe2Variables = {
    tmp: new cv.Mat(),
    prvs: new cv.Mat(),
    magLimit: new cv.Mat(sim.cnv_height, sim.cnv_width, cv.CV_32FC1, new cv.Scalar(5)),

    hsv: new cv.Mat(),
    hsv0: new cv.Mat(sim.cnv_height, sim.cnv_width, cv.CV_8UC1),
    hsv1: new cv.Mat(sim.cnv_height, sim.cnv_width, cv.CV_8UC1, new cv.Scalar(255)),
    hsv2: new cv.Mat(sim.cnv_height, sim.cnv_width, cv.CV_8UC1),
    hsvVec: new cv.MatVector(),
    next: new cv.Mat(sim.cnv_height, sim.cnv_width, cv.CV_8UC1),
    flow: new cv.Mat(sim.cnv_height, sim.cnv_width, cv.CV_32FC2),
    flowVec: new cv.MatVector(),
    mag: new cv.Mat(sim.cnv_height, sim.cnv_width, cv.CV_32FC1),
    ang: new cv.Mat(sim.cnv_height, sim.cnv_width, cv.CV_32FC1),
    rgb: new cv.Mat(sim.cnv_height, sim.cnv_width, cv.CV_8UC3),
    irgb: new cv.Mat(sim.cnv_height, sim.cnv_width, cv.CV_8UC3),
    frame1: undefined,
}

globalGruppe2Variables.hsvVec.push_back(globalGruppe2Variables.hsv0);
globalGruppe2Variables.hsvVec.push_back(globalGruppe2Variables.hsv1);
globalGruppe2Variables.hsvVec.push_back(globalGruppe2Variables.hsv2);


function stepOpenCVFarneback(fn) {
    const { cnv1, ctx2 } = simulation;
    const { prvs, next, flow, flowVec, ang, hsv, hsv0, hsv2, mag, magLimit, hsvVec, rgb, irgb } = globalGruppe2Variables;

    const frame2 = cv.imread(cnv1);

    if (globalGruppe2Variables.frame1) {
        cv.cvtColor(globalGruppe2Variables.frame1, prvs, cv.COLOR_RGBA2GRAY);

        cv.cvtColor(frame2, next, cv.COLOR_RGBA2GRAY);

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
        cv.bitwise_not(rgb, irgb);

        cv.imshow(ctx2.canvas, irgb);

        fn?.call();

        globalGruppe2Variables.frame1.delete();
    }
    globalGruppe2Variables.frame1 = frame2;
}
