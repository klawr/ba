
class Group {
    lines = [];
    pts = undefined;

    addPoints(pts) {
        if (!this.pts) {
            this.pts = pts.map(p => [p]);
        } else if (pts.length !== this.pts.length) {
            throw "nope";
        }
        // This is used through getMaxDist 
        else if (pts.length === 2) {
            const [o] = this.pts;
            const [n1, n2] = pts;

            const s = Math.hypot(n1.y - o.y, n1.x - o.x) <
                Math.hypot(n2.y - o.y, n2.x - o.x);

            this.pts[0].push(pts[+s]);
            this.pts[1].push(pts[+!s]);
        }
        // This is used by LucasKanade, which is sorted anyway
        else {
            this.pts.forEach((p, i) => p.push(pts[i]));
        }
    }

    draw(g) {
        const l = this.lines[this.lines.length - 1];
        const pts = this.pts.map(p => p[p.length - 1]);
        const fs = pts.length === 2 ? ['#00f', '#0f0'] : undefined;

        if (g) {

            l && g.lin({
                x1: 0,
                x2: globalTestVariables.cnv_width,
                y1: l.b,
                y2: l.m * globalTestVariables.cnv_width + l.b,
            });
            pts.forEach((p, i) => g.cir({ ...p, r: 5, fs: fs[i], ls: "@fs" }));
        }
    }
}

class OpenCVLucasKanade {
    ShiTomasi = {
        maxCorners: 30,
        qualityLevel: 0.3,
        minDistance: 7,
        blockSize: 7,
    }

    winSize = new cv.Size(15, 15);
    maxLevel = 2;
    criteria = new cv.TermCriteria(cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 10, 0.03);

    first_indicator = false;
    
    prvs = undefined;
    oldGray = undefined;
    p0 = undefined;
    p1 = undefined;
    none = undefined;
    frameGray = undefined;
    st = undefined;
    err = undefined;
    mask = undefined;

    constructor() {
        this.init();
    }
    
    init() {
        const gtv = globalTestVariables;

        this.first_indicator = false;

        ["prvs", "oldGray", "p0", "none", "frameGray", "p1", "st", "err"].forEach(k => {
            this[k] && this[k].delete();
            this[k] = new cv.Mat();
        });

        // Create a mask image for drawing purposes
        this.mask?.delete();
        this.mask = new cv.Mat(gtv.cnv_height, gtv.cnv_width, cv.CV_8UC4, new cv.Scalar(0, 0, 0, 255));


        this.color = []
        // create some random colors
        for (let i = 0; i < this.ShiTomasi.maxCorners; i++) {
            this.color.push(new cv.Scalar(parseInt(Math.random() * 255), parseInt(Math.random() * 255),
                parseInt(Math.random() * 255), 255));
        }
    }

    // Change drawing to g2
    step(fn) {
        const { ctx2 } = globalTestVariables;
    
        const frame = cv.imread(cnv1);
        if (!this.first_indicator) {
            // take first frame and find corners in it
            cv.cvtColor(frame, this.oldGray, cv.COLOR_RGB2GRAY);
            cv.goodFeaturesToTrack(
                this.oldGray,
                this.p0,
                this.ShiTomasi.maxCorners,
                this.ShiTomasi.qualityLevel,
                this.ShiTomasi.minDistance,
                this.none,
                this.ShiTomasi.blockSize);
            this.first_indicator = true;
        }
    
        cv.cvtColor(frame, this.frameGray, cv.COLOR_RGBA2GRAY);
    
        // calculate optical flow
        cv.calcOpticalFlowPyrLK(this.oldGray, this.frameGray, this.p0, this.p1, this.st, this.err, this.winSize, this.maxLevel, this.criteria);
    
        // select good points
        const goodNew = [];
        const goodOld = [];
        for (let i = 0; i < this.st.rows; i++) {
            if (this.st.data[i] === 1) {
                goodNew.push(new cv.Point(this.p1.data32F[i * 2], this.p1.data32F[i * 2 + 1]));
                goodOld.push(new cv.Point(this.p0.data32F[i * 2], this.p0.data32F[i * 2 + 1]));
            }
        }
    
        // draw the tracks
        for (let i = 0; i < goodNew.length; i++) {
            cv.line(this.mask, goodNew[i], goodOld[i], this.color[i], 2);
            cv.circle(frame, goodNew[i], 5, this.color[i], -1);
        }
        cv.add(frame, this.mask, frame);
        cv.imshow(ctx2.canvas, frame);
    
        // now update the previous frame and previous points
        this.frameGray.copyTo(this.oldGray);
        this.p0 = new cv.Mat(goodNew.length, 1, cv.CV_32FC2);
        for (let i = 0; i < goodNew.length; i++) {
            this.p0.data32F[i * 2] = goodNew[i].x;
            this.p0.data32F[i * 2 + 1] = goodNew[i].y;
        }
    
        fn?.call();

        return goodNew;
    }
}
