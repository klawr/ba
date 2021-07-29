
function filterResult(result, group) {
    return result.filter(e => !group.includes(e));
}

function groupUp(result, g) {
    const groups = [];
    let ungrouped = [...result];

    const min = ungrouped.length / 10;

    colors = ['#00f8', '#0f08', '#0ff8', '#f008', '#f0f8', '#ff08'];

    const bounds = 10;

    last = 0;
    while (ungrouped.length > min && ungrouped.length != last) {
        last = ungrouped.length
        // const pt = ungrouped[0];
        const pt = ungrouped.reduce((pre, cur) => pre.left > cur.left ? pre : cur, ungrouped[0]);

        const hypos = [];
        const lines = [];

        for (let i = 0; i < 360; i += 10) {
            const m_i = Math.tan(i * Math.PI / 360);
            const b_i = pt.y - m_i * pt.x;

            hypos.push([]);
            lines.push({ m: m_i, b: b_i });

            const m_o = -1 / m_i;

            // fix is used to prohibit lines to be favored that consist of less points.
            let fix = 0;
            ungrouped.forEach(e => {
                const b_o = e.y - m_o * e.x;
                const x = (b_o - b_i) / (m_i - m_o) || e.x;
                const y = m_o * x + b_o || b_i;

                const hypo = Math.hypot(e.y - y, e.x - x);
                const score = Math.pow(hypo, 1 / 3);

                if (hypo < bounds) {
                    fix++;
                }

                hypos[hypos.length - 1].push(score);

                // g.lin({ x1: x, y1: y, x2: e.x, y2: e.y });
            });
            hypos[hypos.length - 1] = hypos[hypos.length - 1].map(e => e / fix ** 3);

            g && g.lin({ x1: 0, x2: 400, y1: b_i, y2: m_i * 400 + b_i, ls: 'lightgrey' });
        }
        g && g.cir({ ...pt, r: 5, fs: 'green' });

        const score = hypos.map(h => h.reduce((pre, cur) => pre + cur));

        const idx = score.indexOf(Math.min(...score));
        const line = lines[idx];

        g && g.lin({ x1: 0, x2: 400, y1: line.b, y2: line.m * 400 + line.b, ls: 'blue' });

        const group = [];
        result.forEach(e => {
            const m_o = -1 / line.m;
            const b_o = e.y - m_o * e.x;

            const x = (b_o - line.b) / (line.m - m_o) || e.x;
            const y = m_o * x + b_o;

            if (Math.hypot(e.y - y, e.x - x) < bounds) {
                group.push(e);
                g && g.cir({ ...e, r: 5, fs: colors[groups.length] });
            }
        });

        groups.push(group);

        ungrouped = filterResult(ungrouped, group);
    }
    
    return groups;
}