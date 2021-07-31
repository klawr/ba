const globalMomentanpol1Variables = {
    data: new Data(),
    lines: [],
    poles: [],
    i: 0,
    r: 20,
    g2() {
        return g2().cir({ x: 0, y: 0, r: this.r, ld: [3, 0, 3] }).bar({ x1: -this.r, x2: this.r, y1: 0, y2: 0 })
    },
}

globalTestVariables.reset = function () {
    globalMomentanpol1Variables.lines = [];
    globalMomentanpol1Variables.poles = [];
    globalMomentanpol1Variables.i = 0;
}

function roll() {
    const gmv = globalMomentanpol1Variables;
    const { cnv_height } = globalTestVariables;

    const w = gmv.i / 180 * Math.PI;
    gtv.g.del().clr()
        .use({ x: gmv.r * 2 + gmv.r * w, y: cnv_height / 2, grp: gmv.g2(), w });
    ++gmv.i;
}