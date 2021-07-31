
function bisector(p1, p2, g) {

    const mid = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
    }

    const m = 1 / ((p1.y - p2.y) / (p2.x - p1.x));
    const b = mid.y - m * mid.x;

    g?.lin({
        x1: 0,
        x2: globalTestVariables.cnv_width,
        y1: b,
        y2: m * globalTestVariables.cnv_width + b,
    });

    return { m, b };
}
