
class Group {
    lines = [];
    pts = undefined;

    lk = undefined;

    constructor({ lk }) {
        if (lk) this.lk = new OpenCVLucasKanade();
    }

    lucasKanade(fn) {
        this.addPoints(this.lk.step());
        fn?.call();
    }

    reset() {
        this.lines = [];
        this.pts = undefined;
        this.lk.init();
    }

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

    draw(g, history) {
        const width = globalTestVariables.cnv_width;

        const line = this.lines[this.lines.length - 1];
        const pts = this.pts.map(p => p[p.length - 1]);
        const colors = ['#00f8', '#0f08', '#0ff8', '#f008', '#f0f8', '#ff08'];

        if (history) {
            line && this.lines.forEach(l => g.lin({
                x1: 0, x2: width,
                y1: l.b, y2: l.m * width,
                ls: '#fff8',
            }))
            this.pts.forEach((pt, i) => pt.forEach(p =>
                g.cir({ ...p, r: 1, fs: colors[i % 6], ls: "@fs" })));
        }

        line && g.lin({
            x1: 0, x2: width,
            y1: line.b, y2: line.m * width + line.b,
        });
        pts.forEach((p, i) => g.cir({ ...p, r: 5, fs: colors[i % 6], ls: "@fs" }));
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

    oldGray = undefined;
    p0 = undefined;
    p1 = undefined;
    none = undefined;
    frameGray = undefined;
    st = undefined;
    err = undefined;
    colors = ['#00f8', '#0f08', '#0ff8', '#f008', '#f0f8', '#ff08'];


    constructor() {
        this.init();
    }

    init() {
        this.first_indicator = false;

        ["oldGray", "p0", "none", "frameGray", "p1", "st", "err"]
        .forEach(k => {
            this[k] && this[k].delete();
            this[k] = new cv.Mat();
        });
    }

    goodFeaturesToTrack(frame) {
        cv.cvtColor(frame, this.oldGray, cv.COLOR_RGB2GRAY);
        cv.goodFeaturesToTrack(
            this.oldGray,
            this.p0,
            this.ShiTomasi.maxCorners,
            this.ShiTomasi.qualityLevel,
            this.ShiTomasi.minDistance,
            this.none,
            this.ShiTomasi.blockSize);
    }

    calcOpticalFlowPyrLK() {
        cv.calcOpticalFlowPyrLK(
            this.oldGray,
            this.frameGray,
            this.p0,
            this.p1,
            this.st,
            this.err,
            this.winSize,
            this.maxLevel,
            this.criteria);
    }

    getPoints() {
        const points = [];
        for (let i = 0; i < this.st.rows; i++) {
            if (this.st.data[i] === 1) {
                points.push(new cv.Point(
                    this.p1.data32F[i * 2],
                    this.p1.data32F[i * 2 + 1]));
            }
        }

        return points;
    }

    step() {
        const frame = cv.imread(cnv1);
        if (!this.first_indicator) {
            this.goodFeaturesToTrack(frame);
            this.first_indicator = true;
        }

        cv.cvtColor(frame, this.frameGray, cv.COLOR_RGBA2GRAY);
        this.calcOpticalFlowPyrLK();
        const points = this.getPoints();

        this.frameGray.copyTo(this.oldGray);
        this.p0 = new cv.Mat(points.length, 1, cv.CV_32FC2);
        for (let i = 0; i < points.length; i++) {
            this.p0.data32F[i * 2] = points[i].x;
            this.p0.data32F[i * 2 + 1] = points[i].y;
        }

        return points;
    }
}
