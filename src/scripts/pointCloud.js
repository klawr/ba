
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

        if (len < 2) return 1;

        const s = pts.reduce((pre, cur) => ({
            x: pre.x + cur.x,
            y: pre.y + cur.y,
            xs: pre.xs + cur.x ** 2,
            ys: pre.ys + cur.y ** 2,
            xy: pre.xy + cur.x * cur.y,
        }), { x: 0, y: 0, xs: 0, ys: 0, xy: 0 });


        const nominator = s.xy - s.x * s.y / len;
        const denominator = Math.sqrt(
            (s.xs - (s.x ** 2 / len)) *
            (s.ys - (s.y ** 2 / len)));
        return nominator / denominator;
    }

    /**
     * 
     * @param { g2 } g is a g2 command-queue used for rendering
     * @param {bounds} bounds defines the max. orthogonal distance to the line
     * @returns this PointCloud grouped up into multiple
     */
    groupUp(g, bounds = 10, iterations = 36, warp = 3, fixWarp = 2) {
        const groups = [];
        let ungrouped = [...this.points];

        // There have to be at least 10% of initial points to continue
        const min = ungrouped.length / 10;

        for (let last = 0, len = ungrouped.length;
            ungrouped.length > min && ungrouped.length != last;
            last = len, len = ungrouped.length) {
            // Get left most ungrouped point.
            const pt = ungrouped.reduce((pre, cur) =>
                pre.x < cur.x ? pre : cur);

            const hypos = [];
            const lines = [];

            for (let i = 0; i < 360; i += 360 / iterations) {
                const m = Math.tan(i * Math.PI / 180);
                const b = pt.y - m * pt.x;

                const l = new Line({m, b});

                hypos.push([]);
                lines.push(l);

                // fix is used to prohibit lines to be favored that consist of less points.
                let fix = 0;
                ungrouped.forEach(e => {
                    const hypo = l.orthogonalDistance(e);
                    const score = Math.pow(hypo, 1 / warp);

                    if (hypo < bounds) {
                        fix += fixWarp;
                    }

                    hypos[hypos.length - 1].push(score);
                });
                hypos[hypos.length - 1] = hypos[hypos.length - 1]
                    .map(score => score / fix ** 3);

                g?.lin({
                    x1: 0, x2: 400,
                    y1: b, y2: m * 400 + b,
                    ls: 'lightgrey'
                });
            }
            g?.cir({ ...pt, r: 5, fs: 'green' });

            const score = hypos.map(h => h.reduce((pre, cur) => pre + cur));

            const idx = score.indexOf(Math.min(...score));
            const line = lines[idx];

            g?.lin({ x1: 0, x2: 400, y1: line.b, y2: line.m * 400 + line.b, ls: 'blue' });

            const group = [];
            this.points.forEach(e => {
                const m_o = -1 / line.m;
                const b_o = e.y - m_o * e.x;

                const x = (b_o - line.b) / (line.m - m_o) || e.x;
                const y = m_o * x + b_o;

                if (Math.hypot(e.y - y, e.x - x) < bounds) {
                    group.push(e);
                }
            });

            groups.push(new PointCloud(group));

            ungrouped = ungrouped.filter(e => !group.includes(e));
        }

        if (g) {
            for (let i = 0; i < groups.length; ++i) {
                groups[i].forEach(e => g.cir({
                    ...e, r: 5,
                    fs: globalTestVariables.hsv2rgb(i / groups.length * 360)
                })
                );
            }
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
     * @param {number | Array} K is the number of clusters to be created, or predefined clusters
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

        const centroids = Array.isArray(K) ? K : [[]
            .concat(Array(Math.min(K, this.length) || 0)
                .fill(null)
                .map(() => ({
                    ...this.points[Math.round(Math.random() * this.length)]
                })))];

        if (!centroids[0].length) return [[], []];

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
        }

        g && centroids.forEach((c, i) =>
            c.forEach(d => { g.cir({ ...d, r: i }); }));

        const winner = centroids[centroids.length - 1];
        const groups = winner.map((_, i) =>
            this.points.map(d => ({ ...d, n: findNearestCentroid(d, centroids[i]) }))
                .filter(d => d.n === i));

        g && groups.forEach((c, i) => {
            const color =  globalTestVariables.hsv2rgb(i / winner.length * 360);
            c.forEach(p => g.cir({...p, r: 1, ls: color}));
        });

        return [winner, groups];
    }

    kMeansDijkstra(K, g, maxIter = 10) {
        function findNearestCentroid(pointIdx, dijkstras) {
            return dijkstras.indexOf(dijkstras.reduce((pre, cur) =>
                pre.graph[pointIdx].dist > cur.graph[pointIdx].dist ?
                    cur : pre));
        }

        const centroids = Array.isArray(K) ? K : [[]
            .concat(Array(Math.min(K, this.length) || 0)
                .fill(null)
                .map(() => ({
                    ...this.points[Math.round(Math.random() * this.length)]
                })))];

        if (!centroids[0].length) return [[], []];

        for (let i = 0; i < maxIter; ++i) {
            const dijkstras = centroids[i].map(c => new Dijkstra(this, c, 2));

            const data_assigned = this.points.map((d, i) =>
                ({ ...d, n: findNearestCentroid(i, dijkstras) }));
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
        }

        const winner = centroids[centroids.length - 1];
        const dijkstras = winner.map(c => new Dijkstra(this, c, 2));
        const groups = dijkstras.map((_, i) =>
            new PointCloud(this.points.map((d, j) => ({
                ...d,
                n: findNearestCentroid(j, dijkstras)
            })).filter(d => d.n === i)));


        g && groups.forEach((c, i) => {
            const color =  globalTestVariables.hsv2rgb(i / winner.length * 360);
            const dijk = new Dijkstra(c, winner[i]);
            dijk.draw(g);
            c.forEach(p => g.cir({...p, r: 3, ls: color + "22", fs: '@ls'}));
        });

        return [winner, groups];
    }
}

class Dijkstra {
    points = [];
    graph = [];
    anchor = undefined;

    groupsByCorrelation(g, minCorr = 0.6, minPercent = 0.1) {
        let ends = this.graph
            .filter((n) => !this.graph.some(g => g.pred.id === n.id))
            .sort((a, b) => b.dist - a.dist);

        const winner = [];

        while (ends.length) {
            const occupied = (function f(o, arr) {
                if (o.pred) arr = f(o.pred, arr);
                return [...arr, o];
            })(ends[0], []);
            winner.push(ends.shift());

            ends = ends.filter(u => {
                for (let p = u.pred; p.pred; p = p.pred)
                    if (occupied.includes(p)) return false;
                return true;
            });
        }

        let lines = [];
        for (const win of winner) {
            let group = [];
            for (let u = win; u.pred; u = u.pred) {
                const correlation = PointCloud.correlation(
                    [...group, this.points[u.id]]);
                if (Math.abs(correlation) ** group.length < minCorr) {
                    if (group.length > 2 &&
                        group.length > this.points.length * minPercent) {
                        lines.push(Line.fromRegressionLine(group, g));
                    }
                    group = [];
                }
                group.push(this.points[u.id]);
            }
            if (group.length > this.points.length * minPercent) {
                lines.push(Line.fromRegressionLine(group, g));
            }
        }
        lines = lines.filter(l => l);
        g && lines.forEach(l => l.draw(g));

        return lines;
    }

    draw(g) {
        g.cir({ ...this.anchor, r: 5, fs: '#f00', ls: '@fs' });
        const max = Math.max(...this.graph.map(n => n.dist));

        this.points.forEach((p2, i) => {
            const c = this.graph[i].dist / max * 300;
            const pred = this.graph[i].pred;
            const p1 = pred.id < 0 ? this.anchor : this.points[pred.id];

            g.lin({ p1, p2, ls: `${globalTestVariables.hsv2rgb(c)} ` });
        })
    }

    static euclDistance(p1, p2) {
        return Math.hypot(p1.x - p2.x, p1.y - p2.y);
    }

    constructor(pointcloud, anchor, warp = 2, numEdges = 0) {
        const points = pointcloud.points;
        anchor = anchor || points[0];

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
            edges: compEdges(p),
            pred: undefined,
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
