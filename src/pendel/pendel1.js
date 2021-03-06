
const globalPendel1Variables = {
    ply: [], // Alle Punkte
    trail: [], // Genutzt ab pendel1_4
    nod: undefined,
    data: new DataXY(),
}

function addPointsForCircle(cloud, g, args = { nofilter: false, nomemory: false }) {
    const gpv = globalPendel1Variables;

    const points = cloud.points;

    if (g && !args.nomemory) {
        gpv.ply.forEach(r => {
            // Draw a circle for every found change
            g.cir({ ...r, r: 1, ls: 'red' });
        });
    }

    if (!points) return;

    const ply = args.nomemory ? [] : gpv.ply;

    const cir = makeCircle(points, ply);
    if (args.nofilter) {
        gpv.ply.push(...points);
    }

    if (!args.nomemory) {
        gpv.ply.push(...cir.pts.filter(e => !ply.includes(e)));
    }

    gpv.ply.length && gpv.data.add(cir);

    g && g.cir(cir);

    return cir;
}
