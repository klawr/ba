
class Line {
    m = undefined;
    b = undefined;

    constructor({ p1, p2, m, b }) {
        if (m, b) {
            this.m = m;
            this.b = b;
        }

        if (p1 && p2) {
            this.m = (p2.y - p1.y) / (p2.x - p1.x);
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
        const b = p.y + p.x / this.m;
        return new Line({b, m: - 1 / this.m})
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

    draw(g) {
        g.lin({
            x1: 0,
            x2: globalTestVariables.cnv_width,
            y1: this.b,
            y2: this.m * globalTestVariables.cnv_width + this.b,
        });
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

    /**
     * 
     * @param {PointCloud} pts is a PointCloud
     * @param {g2} g is a g2 command-queue used for rendering
     * @returns a new Line
     */
    static fromRegressionLine(pts, g) {
        let max = 0;
        let p1;
        let p2;

        pts.forEach(r => {
            pts.forEach(s => {
                const hy = Math.hypot(r.y - s.y, r.x - s.x);
                if (hy > max) {
                    max = hy;
                    if (r.x > s.x) {
                        p1 = s;
                        p2 = r;
                    } else {
                        p1 = r;
                        p2 = s;
                    }
                };
            });
        });

        if (!p1 || !p2) {
            return;
        }

        const tmp = (p2.y - p1.y) / (p2.x - p1.x);
        const swap = Math.abs(Math.atan(tmp)) < Math.PI / 4;

        const n = pts.length;
        if (!n) return;
        const sxy = pts.map(e => e.x * e.y).reduce((pre, cur) => cur + pre);
        const sx = pts.map(e => e.x).reduce((pre, cur) => cur + pre);
        const sy = pts.map(e => e.y).reduce((pre, cur) => cur + pre);

        const s2 = pts.map(e => (swap ? e.x : e.y) ** 2).reduce((pre, cur) => cur + pre);

        const counter = (n * sxy - sx * sy);
        const denominator = (n * s2 - (swap ? sx : sy) ** 2);

        let m = swap ? counter / denominator : denominator / counter;
        let b = (sy - m * sx) / n;

        g?.lin({
            x1: 0,
            x2: globalTestVariables.cnv_width,
            y1: b,
            y2: m * globalTestVariables.cnv_width + b
        });

        return new Line({ m, b });
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
}
