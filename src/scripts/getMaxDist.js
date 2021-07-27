
function getMaxDist(result) {
    let p1;
    let p2;
    let max = 0;
    result.forEach(r => {
        result.forEach(s => {
            const hy = Math.hypot(r.y - s.y, r.x - s.x);
            if (hy > max) {
                max = hy;
                p1 = s;
                p2 = r;
            };
        });
    });

    return [p1, p2, max];
}

function getMaxDistCoG(result, number) {
    let copy = [...result];

    const p1s = [];
    const p2s = [];

    for (let idx = 0; idx < number; ++idx) {
        let max = 0;
        let i1 = 0;
        let j1 = 0;
        let p1;
        let p2;
        for (let i = 0; i < copy.length; ++i) {
            for (let j = 1; j < copy.length; ++j) {
                const r = copy[i];
                const s = copy[j];
                const hy = Math.hypot(r.y - s.y, r.x - s.x);

                if (hy > max) {
                    max = hy;
                    i1 = i;
                    j1 = j;
                    p1 = s;
                    p2 = r;
                }
            }
        }

        if (!p1 || !p2) continue;

        const oneToOne = p1s.length &&
            Math.hypot(p1s[0].y - p1.y, p1s[0].x - p1.x) <
            Math.hypot(p2s[0].y - p2.y, p2s[0].x - p2.x);

        if (oneToOne) {
            p1s.push(p1);
            p2s.push(p2);
        } else {
            p1s.push(p2);
            p2s.push(p1);
        }

        copy = copy.splice(i1, 1).splice(j1, 1);
    }

    function cog(arr) {
        let p = arr.reduce((pre, cur) => ({
            x: pre.x + cur.x,
            y: pre.y + cur.y,
        }), { x: 0, y: 0 });
        p.x /= arr.length;
        p.y /= arr.length;

        return p;
    }

    const p1 = cog(p1s);
    const p2 = cog(p2s);
    const max = Math.hypot(p1.y - p2.y, p1.x - p2.x);

    return [p1, p2, max];
}
