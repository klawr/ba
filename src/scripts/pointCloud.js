
class PointCloud {
    points = [];

    constructor(points) {
        this.points = points;
    }

    map() {
        return this.points.map(...arguments);
    }

    forEach() {
        return this.points.forEach(...arguments);
    }

    reduce() {
        return this.points.reduce(...arguments);
    }

    get length() {
        return this.points.length;
    }

    /**
     *
     * @param {*} image1 The first image
     * @param {*} image2 The second image
     * @param {*} width Width of the images (have to be equal)
     * @param {*} height Height of the images (have to be equal)
     * @returns 
     */
    static fromImages(image1, image2, width, height) {
        const difference = [];

        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                const i = y * width + x;
                if (image1[i * 4] !== image2[i * 4]) {
                    difference.push({ x, y });
                };
            }
        }

        return new PointCloud(difference);
    };

    draw(g) {
        this.points.forEach(r => {
            // Draw a circle for every found change
            g.cir({ ...r, r: 1 });
        });
    }

    getMaxDist(g, number = 1) {
        let copy = [...this.points];

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

        g?.cir({ ...p1, r: 5, fs: 'red' }).cir({ ...p2, r: 5, fs: 'red' });

        return [p1, p2, max];
    };

    removeOverlaps(dist = 5) {
        let copy = [...this.points];
        const mostAccurate = [];

        while (copy.length) {
            const max = copy.pop();
            mostAccurate.push(max);
            copy = copy.filter(
                (rec) =>
                    Math.abs(rec.x - max.x) >= dist ||
                    Math.abs(rec.y - max.y) >= dist
            );
        }
        return new PointCloud(mostAccurate);
    };

    groupUp(g) {
        const groups = [];
        let ungrouped = [...this.points];

        const min = ungrouped.length / 10;

        const colors = ['#00f8', '#0f08', '#0ff8', '#f008', '#f0f8', '#ff08'];

        const bounds = 10;

        let last = 0;
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
            this.points.forEach(e => {
                const m_o = -1 / line.m;
                const b_o = e.y - m_o * e.x;

                const x = (b_o - line.b) / (line.m - m_o) || e.x;
                const y = m_o * x + b_o;

                if (Math.hypot(e.y - y, e.x - x) < bounds) {
                    group.push(e);
                    g && g.cir({ ...e, r: 5, fs: colors[groups.length] });
                }
            });

            groups.push(new PointCloud(group));

            ungrouped = ungrouped.filter(e => !group.includes(e));
        }

        return groups;
    };

    kMeansClustering(K, g) {
        function findNearestCentroid(point, centroids) {
            return centroids.indexOf(centroids.reduce((pre, cur) =>
                Math.hypot(pre.y - point.y, pre.x - point.x) <
                    Math.hypot(cur.y - point.y, cur.x - point.x) ?
                    pre : cur));
        }

        const k = Math.min(K, this.length);

        const centroids = [[]];
        for (let i = 0; i < k; ++i) {
            const idx = Math.round(Math.random() * this.length);
            centroids[0].push({ ...this.points[idx] });
        }

        // TODO only works for k === 3;
        const colorize = (i) => {
            const str = "0".repeat(2 - i) + (15 * 16 ** i).toString(16);
            return "#" + str;
        }

        for (let i = 0; i < 10; ++i) {
            const data_assigned = this.points.map(d =>
                ({ ...d, n: findNearestCentroid(d, centroids[i]) }));

            const filtered = centroids[i].map((_, j) => {
                return data_assigned.filter(d => d.n === j);
            });

            const newCentroids = filtered.map(f => {
                const centroid = f.reduce((pre, cur) => ({
                    x: pre.x + cur.x,
                    y: pre.y + cur.y
                }), { x: 0, y: 0 });
                centroid.x /= f.length || 1;
                centroid.y /= f.length || 1;

                return centroid;
            });

            centroids.push(newCentroids);

            g && data_assigned.forEach(d => {
                g.cir({ ...d, r: 1, ls: `${colorize(d.n)}` });
            });
        }

        g && centroids.forEach((c, i) =>
            c.forEach(d => { g.cir({ ...d, r: i }); }));

        return centroids[centroids.length - 1].map((_, i) =>
            this.points.map(d => ({ ...d, n: findNearestCentroid(d, centroids[i]) }))
                .filter(d => d.n === i));
    }

}

function stepCompareImages(fn) {
    const { cnv1 } = globalTestVariables;
    const gtv = globalTestVariables;
    const new_image = cnv1.getContext('2d').getImageData(0, 0, cnv1.width, cnv1.height).data;
    if (gtv.temp_image) {
        const result = PointCloud.fromImages(gtv.temp_image, new_image, cnv1.width, cnv1.height);

        fn?.call(undefined, result);
    }

    gtv.temp_image = new_image;
}
