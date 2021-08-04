
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

        l && g.lin({
            x1: 0,
            x2: globalTestVariables.cnv_width,
            y1: l.b,
            y2: l.m * globalTestVariables.cnv_width + l.b,
        });
        pts.forEach((p, i) => g.cir({...p, r: 5, fs: fs[i], ls: "@fs"}));
    }
}
