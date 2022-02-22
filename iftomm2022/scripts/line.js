
class Line {
    m = undefined;
    b = undefined;

    constructor({ p1, p2, m, b, w }) {
        if (m !== undefined && b !== undefined) {
            this.m = m;
            this.b = b;
        }

        else if (p1 && p2) {
            this.m = (p2.y - p1.y) / (p2.x - p1.x);
            this.b = p1.y - this.m * p1.x;
        }

        else if (p1 && w !== undefined) {
            this.m = Math.tan(w * Math.PI / 180);
            this.b = p1.y - this.m * p1.x;
        }
    }

    /**
     * 
     * @param {Object} p - Point with x and y Values which is used as Reference
     * for the orthogonal 
     * @returns Line which is orthogonal to this line crossing p.
     */
    orthogonal(p) {
        const b = this.m ? p.y + p.x / this.m : p.y;
        return new Line({ b, m: - 1 / this.m })
    }

    orthogonalDistance(p) {
        const o = this.intersection(this.orthogonal(p));
        return Math.hypot(o.y - p.y, o.x - p.x);
    }

    /**
     *
     * @param {Object} p - Point with x and y Values. Must be on this Line. 
     * @param {number} d - Distance to p.
     * @returns Object with x and y having a distance of d to p on this Line
     */
    getPointWithDistance(p, d) {
        const x = p.x - d / Math.sqrt(1 + (this.m ** 2));
        return { x, y: x * this.m + this.b }
    }

    draw(g, opts) {
        g.lin({
            x1: 0,
            x2: simulation.cnv_width,
            y1: this.b,
            y2: this.m * simulation.cnv_width + this.b,
            ...opts
        });
    }

    containsPoint(pt, tol = 1) {
        const y = this.m * pt.x + this.b;
        const x = (pt.y - this.b) / this.m || pt.x;

        return Math.hypot(pt.y - y, pt.x - x) < tol;
    }

    /**
     * 
     * @param {Line} otherLine is just another Line
     * @returns the intersection of this Line and otherLine
     */
    intersection(otherLine) {
        const x = (this.b - otherLine.b) / (otherLine.m - this.m);
        const y = this.m * x + this.b;

        return { x, y };
    }


    // Get bisector of 2 lines. Favor the one with the smaller enclosing angle.
    bisector(otherLine) {
        const w1 = Math.atan(this.m);
        const w2 = Math.atan(otherLine.m);
        const flip = Math.abs((w1 - w2)) > (Math.PI / 2);
        const w = (w1 + w2) / 2 + (flip ? Math.PI / 2 : 0);
        const m = Math.tan(w);
        const p = this.intersection(otherLine);
        const b = p.y - m * p.x || 0;

        return new Line({ m, b });
    }

    /**
     * 
     * @param {PointCloud} pts is a PointCloud
     * @param {g2} g is a g2 command-queue used for rendering
     * @returns a new Line
     */
    static fromRegressionLine(pts, g) {
        const data = new DataXY(pts);

        const sy = data.y.variance;
        const sx = data.x.variance;
        const sxy = data.covariance;

        const m = (sy - sx + Math.sqrt((sy - sx) ** 2 + 4 * sxy ** 2))
            / (2 * sxy);
        const b = data.y.mu - m * data.x.mu;

        g?.lin({
            x1: 0,
            x2: 4000,
            y1: b,
            y2: m * 4000 + b
        });

        return !(Number.isNaN(m) || Number.isNaN(b)) ?
            new Line({ m, b }) :
            null;
    }

    static fromBisector(p1, p2, g) {
        const mid = {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
        }

        const m = 1 / ((p1.y - p2.y) / (p2.x - p1.x));
        const b = mid.y - m * mid.x;

        const line = new Line({ m, b });

        g?.lin({ p1, p2 });
        g && line.draw(g);

        return line;
    }

    static realignGroups(groups, g) {
        const copy = groups.filter(e => e.length);
        const lines = copy.map(c => Line.fromRegressionLine(c));

        const newGroups = Array(copy.length).fill(null).map(_ => []);
        copy.flatMap(c => c.points)
            .forEach(p => {
                newGroups[lines.indexOf(lines.reduce((pre, cur) =>
                    cur.orthogonalDistance(p) < pre.orthogonalDistance(p) ?
                        cur : pre))].push(p);
            });

        g && newGroups.forEach((c, i) => {
            const color = simulation.hsv2rgb(i / copy.length * 360);
            c.forEach(p => {
                g.cir({ ...p, r: 3, ls: color, fs: '@ls' });
            });
        });

        return newGroups;
    }
}
