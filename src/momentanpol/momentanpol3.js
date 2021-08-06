const globalMomentanpolVariables = {
    data: new DataXY(),
    group: new Group({ lk: true }),
    i: 0,
    r: 20,
    draw() {
        return g2()
            .cir({ x: 0, y: 0, r: this.r, ld: [3, 0, 3] })
            .bar({ x1: -this.r, x2: this.r, y1: 0, y2: 0 })
            .nod({ x: -this.r, y: 0 })
            .nod({ x: this.r, y: 0 })
    },
}

globalTestVariables.reset = function () {
    globalMomentanpolVariables.i = 0;
    globalMomentanpolVariables.data.reset();
    globalMomentanpolVariables.group.reset();

    globalTestVariables.g.use({
        x: () => globalMomentanpolVariables.r * 2 +
            globalMomentanpolVariables.r *
            globalMomentanpolVariables.i / 180 * Math.PI,
        y: () => globalTestVariables.cnv_height / 2,
        grp: globalMomentanpolVariables.draw(),
        w: () => - globalMomentanpolVariables.i / 180 * Math.PI
    });
}

function roll() {
    globalMomentanpolVariables.i += 5;
}