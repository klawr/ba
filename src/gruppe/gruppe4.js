
const global_gruppe4_variables = {

}

function find_nearest_centroid(point, centroids) {
    return centroids.indexOf(centroids.reduce((pre, cur) =>
        Math.hypot(pre.y - point.y, pre.x - point.x) <
            Math.hypot(cur.y - point.y, cur.x - point.x) ?
            pre : cur));
}

function k_means_clustering(K, data) {
    const gtv = global_test_variables;

    const g = g2().clr();

    const k = Math.min(K, data.length);

    // TODO create centroids with k
    const centroids = [[]];
    for (let i = 0; i < k; ++i) {
        const idx = Math.round(Math.random() * data.length);
        centroids[0].push({ ...data[idx] });
    }

    // TODO only works for k === 3;
    const colorize = (i) => {
        const str = "0".repeat(2 - i) + (15 * 16 ** i).toString(16);
        return "#" + str;
    }

    for (let i = 0; i < 10; ++i) {
        const data_assigned = data.map(d =>
            ({ ...d, n: find_nearest_centroid(d, centroids[i]) }));

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

        data_assigned.forEach(d => {
            g.cir({ ...d, r: 1, ls: `${colorize(d.n)}` });
        });
    }

    centroids.forEach((c, i) => c.forEach((d, j) => {
        g.cir({ ...d, r: i, ls: `${colorize(j)}` });
    }));

    g.exe(gtv.ctx2);
    
    return centroids[centroids.length - 1].map((_, i) =>
        data.map(d => ({ ...d, n: find_nearest_centroid(d, centroids[i]) }))
            .filter(d => d.n === i));
}
