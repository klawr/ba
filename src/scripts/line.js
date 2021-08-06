
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
        return new Line({ b, m: - 1 / this.m })
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
        const data = new DataXY(pts);

        const sy = data.y.variance;
        const sx = data.x.variance;
        const sxy = data.covariance;

        const m = (sy - sx + Math.sqrt((sy - sx) ** 2 + 4 * sxy ** 2))
            / (2 * sxy);
        const b = data.y.mu - m * data.x.mu;

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
