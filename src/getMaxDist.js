
function getMaxDist(result) {
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

    return [p1, p2];
}
