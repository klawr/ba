
const globalPendel1Variables = {
    ply: [], // Alle Punkte
    trail: [], // Genutzt ab pendel1_4
    nod: undefined,
}

globalTestVariables.reset = function() {
    globalPendel1Variables.ply = [];
    globalPendel1Variables.trail = [];
}

function addPointsForCircle(result, g, args = { nofilter: false, nomemory: false }) {
    const gtv = globalTestVariables;
    const gpv = globalPendel1Variables;

    if (g && !args.nomemory && !gtv.gnd.confident) {
        gpv.ply.forEach(r => {
            if (!gtv.gnd.confident) {
                // Draw a circle for every found change
                g.cir({ ...r, r: 1, ls: 'red' });
            }
        });
    }

    if (!result) return;

    const ply = args.nomemory ? [] : gpv.ply;

    const [cir, pts] = makeCircle(result, ply);
    if (args.nofilter) {
        gpv.ply.push(...result);
    }
    
    if (!args.nomemory) {
        gpv.ply.push(...pts);
    }

    gpv.ply.length && gtv.gnd.add(cir);

    g && g.cir({ ...gtv.gnd.past[gtv.gnd.past.length - 1] });

    return cir;
}
