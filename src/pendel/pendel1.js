
const global_pendel1_variables = {
    ply: [], // Alle Punkte
    trail: [], // Genutzt ab pendel1_4
    nod: undefined,
}

global_test_variables.reset = function() {
    global_pendel1_variables.ply = [];
    global_pendel1_variables.trail = [];
}

function addPointsForCircle(result, args = { nofilter: false, nodraw: false }) {
    const gtv = global_test_variables;
    const gpv = global_pendel1_variables;

    if (!gtv.gnd.confident && !args.nodraw) {
        result.forEach(r => {
            if (!gtv.gnd.confident) {
                // Draw a circle for every found change
                g2().cir({ ...r, r: 1 }).exe(gtv.ctx2);
            }
        });

        global_pendel1_variables.ply.forEach(r => {
            if (!gtv.gnd.confident) {
                // Draw a circle for every found change
                g2().cir({ ...r, r: 1, ls: 'red' }).exe(gtv.ctx2);
            }
        });
    }

    if (!result) return;

    const [cir, pts] = makeCircle(result, gpv.ply);
    if (args.nofilter) {
        gpv.ply.push(...result);
    } else {
        gpv.ply.push(...pts);
    }

    gpv.ply.length && gtv.gnd.add(cir);

    g2().cir({ ...gtv.gnd.past[gtv.gnd.past.length - 1] }).exe(gtv.ctx2);

    return cir;
}
