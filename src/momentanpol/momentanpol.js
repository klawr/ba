const globalMomentanpolVariables = {
    data: new Data(),
    lines: [],
    poles: [],
    i: 0,
    r: 20,
    draw() {
        return g2().cir({ x: 0, y: 0, r: this.r, ld: [3, 0, 3] }).bar({ x1: -this.r, x2: this.r, y1: 0, y2: 0 })
    },
}

globalTestVariables.reset = function () {
    globalMomentanpolVariables.lines = [];
    globalMomentanpolVariables.poles = [];
    globalMomentanpolVariables.i = 0;
    globalMomentanpolVariables.data.reset();
}

function roll() {
    const gmv = globalMomentanpolVariables;
    const { cnv_height, g } = globalTestVariables;

    const w = globalMomentanpolVariables.i / 180 * Math.PI;
    g.del().clr()
        .use({ x: gmv.r * 2 + gmv.r * w, y: cnv_height / 2,
            grp: gmv.draw(), w });
    ++gmv.i;
}