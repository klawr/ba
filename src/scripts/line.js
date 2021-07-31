
class Line {
    m = undefined;
    b = undefined;

    constructor({ p1, p2, m, b }) {
        if (m, b) {
            this.m = m;
            this.b = b;
        }

        if (p1 && p2) {
            this.m = 1 / ((p1.y - p2.y) / (p2.x - p1.x));
            this.b = p1.y - this.m * p1.x;
        }
    }

    draw(g) {
        g.lin({
            x1: 0,
            x2: globalTestVariables.cnv_width,
            y1: this.b,
            y2: this.m * globalTestVariables.cnv_width + this.b,
        });
    }

    intersection(otherLine) {
        const x = (this.b - otherLine.b) / (otherLine.m - this.m);
        const y = this.m * x + this.b;

        return { x, y };
    }

    static fromBisector(p1, p2, g) {
        const mid = {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
        }

        const m = 1 / ((p1.y - p2.y) / (p2.x - p1.x));
        const b = mid.y - m * mid.x;

        const line = new Line({m, b});

        g?.lin({p1, p2});
        g && line.draw(g);

        return line;
    }
}
