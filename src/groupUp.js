
function filterResult(result, group) {
    return result.filter(e => !group.includes(e));
}

function groupUp(result, draw = false) {
    const groups = [];
    let ungrouped = [...result];

    const min = ungrouped.length / 10;

    colors = ['#00f8', '#0f08', '#0ff8', '#f008', '#f0f8', '#ff08'];

    const bounds = 10;

    last = 0;
    while (ungrouped.length > min && ungrouped.length != last) {
        last = ungrouped.length
        const pt = ungrouped[0];

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

                // g2().lin({ x1: x, y1: y, x2: e.x, y2: e.y }).exe(ctx2);
            });
            hypos[hypos.length - 1] = hypos[hypos.length - 1].map(e => e / fix ** 3);

            draw && g2().lin({ x1: 0, x2: 400, y1: b_i, y2: m_i * 400 + b_i, ls: 'lightgrey' }).exe(ctx2);
        }
        draw && g2().cir({ ...pt, r: 5, fs: 'green' }).exe(ctx2);

        const score = hypos.map(h => h.reduce((pre, cur) => pre + cur));

        const idx = score.indexOf(Math.min(...score));
        const line = lines[idx];

        draw && g2().lin({ x1: 0, x2: 400, y1: line.b, y2: line.m * 400 + line.b, ls: 'blue' }).exe(ctx2);

        const group = [];
        result.forEach(e => {
            const m_o = -1 / line.m;
            const b_o = e.y - m_o * e.x;

            const x = (b_o - line.b) / (line.m - m_o) || e.x;
            const y = m_o * x + b_o;

            if (Math.hypot(e.y - y, e.x - x) < bounds) {
                group.push(e);
                draw && g2().cir({ ...e, r: 5, fs: colors[groups.length] }).exe(ctx2);
            }
        });

        groups.push(group);
        ungrouped = filterResult(ungrouped, group);
    }
    
    return groups;
}