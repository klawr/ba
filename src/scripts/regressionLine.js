
function regressionLine(pts, g) {
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

    return { m, b };
}
