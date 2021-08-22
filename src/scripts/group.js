
class Group {
    lines = [];
    pts = [];

    getPoint(idx, threshold = 1) {
        return this.pts[idx][this.pts[idx].length - threshold];
    }

    getLine(threshold = 1) {
        return this.lines[this.lines.length - threshold];
    }

    lk = undefined;

    constructor({ lk } = { lk: undefined }) {
        if (lk) this.lk = new OpenCVLucasKanade(lk);
    }

    stepRegression(fn) {
        this.lucasKanade();
        const pts = this.regressionLine();

        fn?.call(undefined, pts);
    }

    // NOTE CAREFUL THIS CREATES FALSE POSITIVES FOR ROTATION AND TRANSLATION
    stepBisector(fn, frames = 1) {
        const frame = cv.imread(simulation.cnv1);
        this.addPoints(this.lk.step(frame));

        const len = this.pts[0]?.length;
        if (len > frames) {
            const p = this.pts[0];
            this.lines.push(Line.fromBisector(p[len - 1], p[len - frames - 1]));
        }

        fn?.call();
    }

    regressionLine() {
        const { cnv1 } = simulation;
        const sim = simulation;
        const new_image = cnv1.getContext('2d')
            .getImageData(0, 0, cnv1.width, cnv1.height).data;
        let pts;
        if (sim.temp_image) {
            pts = PointCloud.fromImages(
                sim.temp_image, new_image, cnv1.width, cnv1.height);
            this.lines.push(Line.fromRegressionLine(pts));
        }

        sim.temp_image = new_image;

        return pts;
    }

    momentanpol(threshold = 1, maxDist = 0) {
        if (!(this.pts.length > 0) ||
            !(this.pts[0].length > threshold) ||
            !(this.lines.length > threshold)) {
            return;
        }

        const filtered = maxDist ? this.pts.filter(pt => {
            const l = this.lines[this.lines.length - 1];
            const p = pt[pt.length - 1];

            return l.orthogonalDistance(p) < maxDist;
        }) : this.pts;

        const mu = (i) => {
            const pt = filtered.map(p => p[p.length - i])
                .reduce((pre, cur) => ({
                    x: pre.x + cur.x,
                    y: pre.y + cur.y,
                }), { x: 0, y: 0 });
            return {
                x: pt.x / filtered.length,
                y: pt.y / filtered.length,
            };
        }

        const p1 = mu(1);
        const p2 = mu(threshold + 1);

        const w1 = Math.atan(this.lines[this.lines.length - 1].m);
        const w2 = Math.atan(this.lines[this.lines.length - (threshold + 1)].m);

        const v = {
            x: p1.x - p2.x,
            y: p1.y - p2.y
        };

        let dw = ((w1 - w2) + Math.PI) % Math.PI;
        dw = dw > Math.PI / 2 ? dw - Math.PI : dw;

        return {
            x: (p1.x + p2.x) / 2 - v.y / dw,
            y: (p1.y + p2.y) / 2 + v.x / dw,
        }
    }

    lucasKanade(fn) {
        const frame = cv.imread(simulation.cnv1);
        this.addPoints(this.lk.step(frame));
        fn?.call();
    }

    addPoints(pts) {
        if (!pts?.length || pts.some(e => !e)) {
            return;
        }
        else if (!this.pts.length) {
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
        const { width, hsv2rgb } = simulation;

        const line = this.lines[this.lines.length - 1];
        const pts = this.pts?.map(p => p[p.length - 1]);

        const color = (i) => hsv2rgb(i / this.pts.length * 360) + '88';

        if (this.pts && history) {
            line && this.lines.forEach(l => g.lin({
                x1: 0, x2: width,
                y1: l.b, y2: l.m * width,
                ls: '#fff8',
            }))
            this.pts.forEach((pt, i) => pt.forEach(p =>
                g.cir({ ...p, r: 1, fs: color(i), ls: "@fs" })));
        }

        line && g.lin({
            x1: 0, x2: width,
            y1: line.b, y2: line.m * width + line.b,
        });
        pts?.forEach((p, i) => g.cir({ ...p, r: 5, fs: color(i), ls: "@fs" }));
    }
}

class OpenCVLucasKanade {
    // ShiTomasi Parameter
    maxCorners = 30;
    qualityLevel = 0.3;
    minDistance = 7;
    blockSize = 7;

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

    constructor(options) {
        options && Object.assign(this, options);
        this.first_indicator = false;

        ["oldGray", "p0", "none", "frameGray", "p1", "st", "err"]
            .forEach(k => {
                this[k]?.delete();
                this[k] = new cv.Mat();
            });
    }

    goodFeaturesToTrack(frame) {
        cv.cvtColor(frame, this.oldGray, cv.COLOR_RGB2GRAY);
        cv.goodFeaturesToTrack(
            this.oldGray,
            this.p0,
            this.maxCorners,
            this.qualityLevel,
            this.minDistance,
            this.none,
            this.blockSize);
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

    very_first = true;

    step(frame) {
        if (this.very_first) {
            this.very_first = false;
            return;
        }
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
