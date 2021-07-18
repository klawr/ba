
function test(result) {
    let p1;
    let p2;
    let max = 0;

    result.forEach(r => {
        result.forEach(s => {
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

    const n = result.length;
    if (!n) return;
    const sxy = result.map(e => e.x * e.y).reduce((pre, cur) => cur + pre);
    const sx = result.map(e => e.x).reduce((pre, cur) => cur + pre);
    const sy = result.map(e => e.y).reduce((pre, cur) => cur + pre);

    const s2 = result.map(e => (swap ? e.x : e.y) ** 2).reduce((pre, cur) => cur + pre);

    const counter = (n * sxy - sx * sy);
    const denominator = (n * s2 - (swap ? sx : sy) ** 2);

    let m = swap ? counter / denominator : denominator / counter;
    let b = (sy - m * sx) / n;

    return { m, b };
}
