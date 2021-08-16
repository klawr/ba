
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
     * @param {number} width Width of the images (have to be equal)
     * @param {number} height Height of the images (have to be equal)
     * @returns { PointCloud } PointCloud of coordinates with different
     * pixelvalues in both images
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

    /**
     * 
     * @param {g2} g is a g2 command-queue used for rendering
     * @param {*} number of how many points the cog should be calculated to act
     * as a mean for multiple points
     * @returns 
     */
    getMaxDist(g, number = 1) {
        let p1;
        let p2;
        let max = 0;
        for (let i = 0; i < this.points.length; ++i) {
            for (let j = i + 1; j < this.points.length; ++j) {
                const r = this.points[i];
                const s = this.points[j];
                const hy = Math.hypot(r.y - s.y, r.x - s.x);
                if (hy > max) {
                    max = hy;
                    p1 = s;
                    p2 = r;
                };
            }
        }

        if (number > 1) {
            const getDist = p => (a, b) =>
                Math.hypot(p.y - a.y, p.x - a.x) -
                Math.hypot(p.y - b.y, p.x - b.x);
            const cog = (pre, cur) => ({ y: pre.y + cur.y, x: pre.x + cur.x });
            p1 = [...this.points]
                .sort(getDist(p1))
                .slice(0, number)
                .reduce(cog);
            p1.x /= number;
            p1.y /= number;
            p2 = [...this.points]
                .sort(getDist(p2))
                .slice(0, number)
                .reduce(cog);
            p2.x /= number;
            p2.y /= number;
        }
        g?.cir({ ...p1, r: 5, fs: 'red' }).cir({ ...p2, r: 5, fs: 'red' });

        return { p1, p2 };
    };


    /**
     * 
     * @param {number} dist is the distance of how big the distance should be to
     * the next point
     * @returns a less dense PointCloud
     */
    removeOverlaps(dist = 5) {
        let copy = [...this.points];
        const survivor = [];

        while (copy.length) {
            const pt = copy.pop();
            survivor.push(pt);
            copy = copy.filter(
                (rec) =>
                    Math.abs(rec.x - pt.x) >= dist ||
                    Math.abs(rec.y - pt.y) >= dist
            );
        }
        return new PointCloud(survivor);
    };

    static correlation(pts) {
        const len = pts.length;

        const s = pts.reduce((pre, cur) => ({
            x: pre.x + cur.x,
            y: pre.y + cur.y,
            xs: pre.xs + cur.x ** 2,
            ys: pre.ys + cur.y ** 2,
            xy: pre.xy + cur.x * cur.y,
        }), { x: 0, y: 0, xs: 0, ys: 0, xy: 0 });


        const nominator = s.xy - s.x * s.y;
        const denominator = Math.sqrt(
            (s.xs - (s.x ** 2 / len)) *
            (s.ys - (s.y ** 2 / len)));
        return nominator / denominator;
    }

    /**
     * 
     * @param {g2} g is a g2 command-queue used for rendering
     * @param {number} bounds is the max distance of points
     * @returns this PointCloud grouped up into an array of PointClouds 
     */
    groupByCorrelation(g, bounds = 10) {
        const groups = [];
        let ungrouped = [...this.points];

        const min = ungrouped.length / 10;

        let last = 0;
        while (ungrouped.length > min && ungrouped.length != last) {
            last = ungrouped.length;
            // Get left most ungrouped point.
            const pt = ungrouped.reduce((pre, cur) =>
                pre.x < cur.x ? pre : cur);

            // 36 lines are checked
            const coefficients = [];

            const lines = [];

            for (let i = 0; i < 360; i += 10) {
                const inbounds = [];

                const m_i = Math.tan(i * Math.PI / 180)
                const b_i = pt.y - m_i * pt.x;

                lines.push({ m: m_i, b: b_i });

                const m_o = - 1 / m_i;

                ungrouped.forEach(e => {
                    const b_o = e.y - m_o * e.x;

                    const x = (b_o - b_i) / (m_i - m_o) || e.x;
                    const y = m_o * x + b_o || b_i;

                    if (Math.hypot(e.y - y, e.x - x) < bounds) {
                        inbounds.push(e);
                    }
                });

                coefficients.push(PointCloud.correlation(inbounds));
            }

            console.log(coefficients);
        }
    }

    /**
     * 
     * @param { g2 } g is a g2 command-queue used for rendering
     * @returns this PointCloud grouped up into multiple
     * TODO add more info how this works...
     */
    groupUp(g) {
        const groups = [];
        let ungrouped = [...this.points];

        // There have to be at least 10% of initial points to continue
        const min = ungrouped.length / 10;

        // points to consider for respective line
        const bounds = 10;

        for (let last = 0, len = ungrouped.length;
            ungrouped.length > min && ungrouped.length != last;
            last = len, len = ungrouped.length) {
            // Get left most ungrouped point.
            const pt = ungrouped.reduce((pre, cur) =>
                pre.x < cur.x ? pre : cur);

            const hypos = [];
            const lines = [];

            for (let i = 0; i < 360; i += 10) {
                const m_i = Math.tan(i * Math.PI / 180);
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
                        fix += 2;
                    }

                    hypos[hypos.length - 1].push(score);
                });
                hypos[hypos.length - 1] = hypos[hypos.length - 1]
                    .map(score => score / fix ** 3);

                g?.lin({
                    x1: 0, x2: 400,
                    y1: b_i, y2: m_i * 400 + b_i,
                    ls: 'lightgrey'
                });
            }
            g?.cir({ ...pt, r: 5, fs: 'green' });

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
                    g && g.cir({
                        ...e, r: 5,
                        fs: globalTestVariables.hsv2rgb(groups.length / (this.points.length + 1) * 360)
                    });
                }
            });

            groups.push(new PointCloud(group));

            ungrouped = ungrouped.filter(e => !group.includes(e));
        }

        return groups;
    };

    // less is better
    getScore(line, g) {
        const m = -1 / line.m;

        const score = this.points.reduce((pre, cur) => {
            const b = cur.y - m * cur.x;
            const x = (b - line.b) / (line.m - m) || cur.x;
            const y = m * x + b || Infinity;

            g?.lin({ p1: { x, y }, p2: cur });

            const dist = Math.hypot(y - cur.y, x - cur.x);

            return pre + dist;
        }, 0);

        return score / (1 ** 3);
    }

    groupBinary(pts, g) {
        const groups = [];

        for (const pt of pts) {
            const dijkstras = new Dijkstra(this.points, pt, 2);
            dijkstras.draw(g);
            const dists = dijkstras.graph.map(n => n.dist);

            const getScore = (line, g) => {
                const m = - 1 / line.m;
                const score = this.points.reduce((pre, cur, idx) => {
                    const b = cur.y - m * cur.x;
                    const x = (b - line.b) / (line.m - m);
                    const y = m * x + b;
                    g?.lin({ p1: { x, y }, p2: cur });
                    const dist = Math.hypot(y - cur.y, x - cur.x);

                    return pre + dist / dists[idx] ** 2;
                }, 0);

                return score;
            }

            for (let i = 0; i < 1; ++i) {
                let lines = [
                    new Line({ w: i / 120 + 1, p1: pt }),
                    new Line({ w: i / 120 + 61, p1: pt }),
                    new Line({ w: i / 120 - 59, p1: pt })]
                    .sort((a, b) => getScore(a) - getScore(b))
                    .splice(0, 2);

                for (let j = 0; j < 10; ++j) {
                    const l1 = lines[0];
                    const l2 = lines[1];
                    lines = [
                        getScore(l1) < getScore(l2) ? l1 : l2,
                        l1.bisector(l2)
                    ];
                }

                const l1 = lines[0];
                const l2 = lines[1];
                groups.push(getScore(l1, g) < getScore(l2) ? l1 : l2);
            }
        }

        if (g) {
            pts.forEach(p => g.cir({ ...p, r: 4, ls: 'green' }));
            groups.forEach(l => l.draw(g));
        }

        return groups;
    }

    /**
     * 
     * @param {number} K is the number of clusters to be created
     * @param {g2} g is a g2 command-queue used for rendering
     * @returns The mean of the points corresponding to a centroid.
     */
    kMeansClustering(K, g, maxIter = 10) {
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

        for (let i = 0; i < maxIter; ++i) {
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
                g.cir({
                    ...d, r: 1,
                    ls: globalTestVariables.hsv2rgb(d.n * 360 / k)
                });
            });
        }

        g && centroids.forEach((c, i) =>
            c.forEach(d => { g.cir({ ...d, r: i }); }));

        return centroids[centroids.length - 1].map((_, i) =>
            this.points.map(d => ({ ...d, n: findNearestCentroid(d, centroids[i]) }))
                .filter(d => d.n === i));
    }

}

class Dijkstra {
    points = [];
    graph = [];
    anchor = undefined;

    draw(g) {
        g.cir({ ...this.anchor, r: 5, fs: '#f00', ls: '@fs' });
        const max = Math.max(...this.graph.map(n => n.dist));

        this.points.forEach((p2, i) => {
            const c = this.graph[i].dist / max * 300;
            const pred = this.graph[i].pred;
            const p1 = pred.id < 0 ? this.anchor : this.points[pred.id];

            if (!p1) {
                console.log(p1);
            }

            g.lin({ p1, p2, ls: `${globalTestVariables.hsv2rgb(c)} ` });
        })
    }

    static euclDistance(p1, p2) {
        return Math.hypot(p1.x - p2.x, p1.y - p2.y);
    }

    constructor(points, anchor, warp = 2, numEdges = 0) {
        if (numEdges < 1) {
            numEdges = points.length - 1;
        }

        this.points = points;
        this.anchor = anchor;

        const compEdges = (p) => points
            .map((sp, sidx) => ({
                target: sidx,
                weight: Dijkstra.euclDistance(p, sp) ** warp,
            }))
            .sort((a, b) => a.weight - b.weight)
            .slice(1, numEdges + 1);

        const graph = points.map((p, id) => ({
            id,
            dist: Infinity,
            known: false,
            edges: compEdges(p)
        }));
        const unvisited = [...graph];
        unvisited.unshift({
            id: -1,
            dist: 0,
            known: false,
            edges: compEdges(anchor)
        });

        while (unvisited.length) {
            unvisited.sort((a, b) => a.dist - b.dist);
            const u = unvisited.shift();
            u.known = true;

            // NOTE: dist is the sum of warped eucl. distances
            for (const { ldist, o } of u.edges
                .map(e => ({ ldist: e.weight, o: graph[e.target] }))
                .filter(({ o }) => !o.known)) {
                const cdist = u.dist + ldist;
                if (cdist < o.dist) {
                    o.dist = cdist;
                    o.pred = u;
                }
            }
        }

        this.graph = graph;
    };
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
